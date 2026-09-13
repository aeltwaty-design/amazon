// Renders every scene in scenes.js to a transparent PNG (scratch) and a WebP
// (public/illustrations) with headless Chromium + Three.js.
//   node scripts/render/render.mjs [--out dir] [scene...]
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const outDir = outIdx >= 0 ? argv[outIdx + 1] : path.join(root, 'public', 'illustrations');
const only = argv.filter((a, i) => outIdx < 0 || (i !== outIdx && i !== outIdx + 1));
// Lossless PNG masters land outside public/ (git-ignored) for inspection.
const pngDir = process.env.RENDER_PNG_DIR || path.join(root, '.render');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });

const THREE_VER = '0.170.0';
const cdn = `https://cdn.jsdelivr.net/npm/three@${THREE_VER}`;
const svgData = (p) => `data:image/svg+xml;base64,${fs.readFileSync(p).toString('base64')}`;

// Amazon smile only (the two orange paths of public/brand/amazon.svg).
const smileSvg = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="335" height="85" viewBox="80 100 335 85"><g fill="${color}"><path d="m 374.00642,142.18404 c -34.99948,25.79739 -85.72909,39.56123 -129.40634,39.56123 -61.24255,0 -116.37656,-22.65135 -158.08757,-60.32496 -3.2771,-2.96252 -0.34083,-6.9999 3.59171,-4.69283 45.01431,26.19064 100.67269,41.94697 158.16623,41.94697 38.774689,0 81.4295,-8.02237 120.6499,-24.67006 5.92501,-2.51683 10.87999,3.88009 5.08607,8.17965"/><path d="m 388.55678,125.53635 c -4.45688,-5.71527 -29.57261,-2.70033 -40.84585,-1.36327 -3.43442,0.41947 -3.95874,-2.56925 -0.86517,-4.71905 20.00346,-14.07844 52.82696,-10.01483 56.65462,-5.2958 3.82764,4.74526 -0.99624,37.64741 -19.79373,53.35128 -2.88385,2.41195 -5.63662,1.12734 -4.35198,-2.07113 4.2209,-10.53917 13.68519,-34.16054 9.20211,-39.90203"/></g></svg>`;

const assets = {
  mark: svgData(path.join(root, 'public/brand/walaone-mark.svg')),
  markWhite: svgData(path.join(root, 'public/brand/walaone-mark-white.svg')),
  smile: `data:image/svg+xml;base64,${Buffer.from(smileSvg('#FF9900')).toString('base64')}`,
};

const scenesSrc = fs.readFileSync(path.join(here, 'scenes.js'), 'utf8');
const html = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="importmap">{"imports":{"three":"${cdn}/build/three.module.js","three/addons/":"${cdn}/examples/jsm/"}}</script>
<script type="module">
${scenesSrc.replace(/^export /gm, '')}
window.__scenes = Object.keys(SCENES);
window.__render = render;
await setup(${JSON.stringify(assets)});
window.__ready = true;
</script></body></html>`;

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready, null, { timeout: 120_000 });

const names = only.length ? only : await page.evaluate(() => window.__scenes);
for (const name of names) {
  const t0 = Date.now();
  const dataUrl = await page.evaluate((n) => window.__render(n), name);
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.join(pngDir, `${name}.png`), png);
  const webp = await sharp(png).webp({ quality: 88, alphaQuality: 92, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(outDir, `${name}.webp`), webp);
  console.log(
    `${name}: png ${(png.length / 1024).toFixed(0)} kB, webp ${(webp.length / 1024).toFixed(0)} kB, ${Date.now() - t0} ms`,
  );
}
await browser.close();
