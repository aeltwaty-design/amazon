// The map capture for the closing band's second phone. The WalaOne map screen
// already exists in the repo, but only inside a phone: it is the screen placed
// in the "map-phone" mockup that Benefits card 1 shows. This script lifts it
// back out — it rasterises that mockup's screen mask (the same
// src/map-phone.json geometry build-phone-mockup.mjs uses), takes the mask's
// bounding box out of the export and writes the capture on its own, at the
// export's own resolution, so it matches the home captures in public/app/.
// Nothing is recoloured or resampled: these are the export's pixels.
// Input, git-ignored (re-export when the node changes): the Figma MCP
// download_assets PNG export of node 55977:6896 at scale 2, saved as
// .render/figma/map-phone@2x.png. Usage: npm run render:map
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const input = path.join(root, '.render/figma/map-phone@2x.png');
const geometryFile = path.join(root, 'scripts/render/src/map-phone.json');
const out = path.join(root, 'public/app/map.webp');
const WEBP = { quality: 82, effort: 6 };
/** the home captures are 750 × 1624; the screen mask must land on that */
const EXPECT = { width: 750, height: 1624 };

if (!fs.existsSync(input)) {
  throw new Error(
    `${path.relative(root, input)} is missing: export Figma node 55977:6896 as PNG at scale 2 (see the header) and save it there`,
  );
}

const geometry = JSON.parse(fs.readFileSync(geometryFile, 'utf8'));
const [vbX, vbY, vbW, vbH] = geometry.viewBox;
const png = sharp(input);
const meta = await png.metadata();
const scale = Math.round(meta.width / vbW);
if (scale < 1 || Math.abs(meta.width - vbW * scale) > 2) {
  throw new Error(
    `${path.relative(root, input)} is ${meta.width} × ${meta.height}; expected the ${vbW} × ${vbH} node at an integer scale`,
  );
}

// The screen mask over the whole viewBox, so its bounding box is already in
// the export's pixels.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW * scale}" height="${vbH * scale}"><path d="${geometry.screen.d}" fill="#fff" fill-rule="evenodd"/></svg>`;
const { data, info } = await sharp(Buffer.from(svg))
  .ensureAlpha()
  .extractChannel('alpha')
  .raw()
  .toBuffer({ resolveWithObject: true });

let minX = info.width;
let minY = info.height;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[y * info.width + x] <= 127) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}
if (maxX < 0) throw new Error('the screen mask matched no pixels');
const width = maxX - minX + 1;
const height = maxY - minY + 1;
if (width !== EXPECT.width || height !== EXPECT.height) {
  throw new Error(
    `the screen is ${width} × ${height}; the home captures are ${EXPECT.width} × ${EXPECT.height} and the phone draws them at one aspect`,
  );
}

const buffer = await png
  .clone()
  .extract({ left: minX, top: minY, width, height })
  .webp(WEBP)
  .toBuffer();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buffer);
console.log(
  `${path.relative(root, out)} — ${width} × ${height}, ${(buffer.length / 1024).toFixed(1)} kB`,
);
