// The Brands section's merchant logos, from walaone.com: the "3,500+ service
// providers" block on https://www.walaone.com/ (div.cf-logos-wrapper-merch …
// img.cf-logo-images-2). The sources are colour files (ten 350 × 350 JPGs
// with the logo placed on white, two small alpha PNGs); the site greys them
// with CSS, this page keeps the colour. For each merchant this script fetches
// the file once (cached in .render/brands/, git-ignored), flattens it on
// white, trims the white margins and fits the logo into a square canvas at a shared ink area, on a
// 320 × 320 white ground, so every logo sits at one optical size, then writes
// public/brands/<id>.webp and prints the size for lib/art.ts. Amazon comes
// from the local vector in public/brand/ instead of the site's 144 px PNG.
// Usage: npm run render:brands [-- id …]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cacheDir = path.join(root, '.render/brands');
const outDir = path.join(root, 'public/brands');
const CDN = 'https://cdn.prod.website-files.com/66af02700170090a1403d9e3/';

/** the canvas every logo is normalised onto (mirrored in lib/art.ts BRAND_CANVAS) */
const CANVAS = { w: 320, h: 320 };
/** the box a logo may fill: nothing is ever scaled past this */
const INNER = { w: 272, h: 272 };
/**
 * Fitting every logo to the same box makes a square mark read far heavier than
 * a long wordmark, because the wordmark only uses a sliver of the box's height.
 * So each logo is scaled to the same *ink area* instead, as a fraction of the
 * inner box, and only then clamped to the box. A wordmark ends up filling the
 * width, a square mark sits at roughly 58 % of it, and the two read alike.
 */
const TARGET_AREA = 0.34;
/** pixels within this distance of white count as margin */
const TRIM_THRESHOLD = 12;
const WEBP = { quality: 82, effort: 6 };
/** the tile fill; also what the alpha sources are flattened on */
const WHITE = '#fff';
/** rasterisation density for the vector source (the default 72 dpi would be soft) */
const SVG_DENSITY = 300;

/** walaone.com's DOM order; `scale` shrinks a mark that reads too heavy at the full inner box */
const SOURCES = [
  { id: 'baskin-robbins', src: `${CDN}673cddb1f7c2c42a7741c8d1_5.jpg` },
  { id: 'ninja', src: `${CDN}673cddcc29228f4aab70ade3_7.jpg` },
  { id: 'noon', src: `${CDN}673cddcc3ddb6429464ad01a_2.jpg` },
  { id: 'toyou', src: `${CDN}673cddcc413bfc94aa8cb011_4.jpg` },
  { id: 'aliexpress', src: `${CDN}673cddccbdddee7833d34a52_8.jpg` },
  { id: 'dr-cafe', src: `${CDN}673cddccd2447c6589c10b1d_6.jpg` },
  { id: 'temu', src: `${CDN}673cddcc7e224971df018be1_9.jpg`, scale: 0.9 },
  { id: 'dominos', src: `${CDN}673cddccbdddee7833d34a78_3.jpg`, scale: 0.9 },
  { id: 'nana', src: `${CDN}66afed3067830b2a3188f8dd_image-16.png` },
  { id: 'deraah', src: `${CDN}673cddcc7ca3edeaa0b9d5d2_1.jpg` },
  { id: 'amazon', src: 'public/brand/amazon.svg' },
  { id: 'tiko', src: `${CDN}673cddcc9efb84c0be4f8520_10.jpg`, scale: 0.9 },
];

async function source({ id, src }) {
  if (!src.startsWith('http')) return fs.readFileSync(path.join(root, src));
  const ext = path.extname(new URL(src).pathname) || '.bin';
  const cached = path.join(cacheDir, `${id}${ext}`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${id}: ${res.status} fetching ${src}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cached, buf);
  return buf;
}

async function build(entry) {
  const buf = await source(entry);
  const isSvg = entry.src.endsWith('.svg');
  const scale = entry.scale ?? 1;
  // white margins off, then the logo fitted into the inner box (enlarging a
  // small source is intended: the canvas is the size the tile shows at 2×)
  const trimmed = await sharp(buf, isSvg ? { density: SVG_DENSITY } : {})
    .flatten({ background: WHITE })
    .trim({ background: WHITE, threshold: TRIM_THRESHOLD })
    .toBuffer();
  // the trimmed logo's own proportions, fitted to the inner box, then pulled
  // back to the shared ink area (never up past the box, never past the source
  // being enlarged more than the box already allows)
  const fitted = await sharp(trimmed)
    .resize({ width: INNER.w, height: INNER.h, fit: 'inside' })
    .metadata();
  const area = fitted.width * fitted.height;
  const k = Math.min(
    Math.sqrt((TARGET_AREA * INNER.w * INNER.h) / area),
    INNER.w / fitted.width,
    INNER.h / fitted.height,
  );
  const logo = await sharp(trimmed)
    .resize({
      width: Math.max(1, Math.round(fitted.width * k * scale)),
      height: Math.max(1, Math.round(fitted.height * k * scale)),
      fit: 'inside',
    })
    .toBuffer();
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${entry.id}.webp`);
  const info = await sharp({
    create: { width: CANVAS.w, height: CANVAS.h, channels: 3, background: WHITE },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .webp(WEBP)
    .toFile(out);
  const meta = await sharp(logo).metadata();
  console.log(
    `${entry.id}: ${info.width} × ${info.height}, ${(info.size / 1024).toFixed(0)} kB (logo ${meta.width} × ${meta.height})`,
  );
}

async function main() {
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((id) => !SOURCES.some((s) => s.id === id));
  if (unknown.length) throw new Error(`unknown merchant(s): ${unknown.join(', ')}`);
  for (const entry of SOURCES) {
    if (wanted.length && !wanted.includes(entry.id)) continue;
    await build(entry);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
