// The flag in the phone field's country block: the Twemoji Saudi Arabia flag
// (SVG Repo 405595 "Flag for Flag: Saudi Arabia", the Twemoji set; graphics
// CC-BY 4.0 by Twitter, https://github.com/twitter/twemoji). An emoji flag is
// drawn as a rounded tile on a 36 × 36 canvas: the flag itself is the rect
// x 0…36, y 5…31, so the canvas carries 5 units of transparent padding above
// and below. This crops the viewBox to that rect, so the WebP is the flag and
// nothing else and the block's gap to the dial code is the gap it looks like,
// and rasterises at 3× the size it is drawn at.
//
// The corners are the emoji tile's own 4-unit radius, baked in, so the page
// does not round or crop the image — cropping it to another ratio would cut
// the shahada. 36 : 26 is also within a third of a pixel of the 24 × 17.14
// the Singular phone field draws (node 8629:339487).
//
// Input, git-ignored: .render/flags/sa.svg, from
// https://www.svgrepo.com/show/405595/flag-for-flag-saudi-arabia.svg
// (the /download/ path sits behind a JS checkpoint; /show/ serves the file).
// Usage: npm run render:flag
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const input = path.join(root, '.render/flags/sa.svg');
const outDir = path.join(root, 'public/flags');
const out = path.join(outDir, 'sa.webp');

/** the flag rect inside the 36 × 36 emoji canvas */
const FLAG = { x: 0, y: 5, w: 36, h: 26 };
/** the width the block draws it at, and the factor the raster is built at */
const DISPLAY_W = 24;
const SCALE = 3;

async function main() {
  if (!fs.existsSync(input)) {
    throw new Error(`${path.relative(root, input)} is missing (see the header)`);
  }
  const svg = fs.readFileSync(input, 'utf8');

  const width = DISPLAY_W * SCALE;
  const height = Math.round((FLAG.h / FLAG.w) * width);

  // Re-point the viewBox at the flag and ask for the exact raster size, so
  // librsvg scales the vector rather than sharp resampling a bitmap.
  const cropped = svg
    .replace(/viewBox="[^"]*"/, `viewBox="${FLAG.x} ${FLAG.y} ${FLAG.w} ${FLAG.h}"`)
    .replace(/\swidth="[^"]*"/, ` width="${width}px"`)
    .replace(/\sheight="[^"]*"/, ` height="${height}px"`);
  if (!cropped.includes(`viewBox="${FLAG.x} ${FLAG.y}`)) {
    throw new Error('the source SVG has no viewBox to re-point');
  }

  fs.mkdirSync(outDir, { recursive: true });
  await sharp(Buffer.from(cropped), { density: 72 * SCALE })
    .resize(width, height, { fit: 'fill' })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(out);

  const { size } = fs.statSync(out);
  const meta = await sharp(out).metadata();
  console.log(
    `${path.relative(root, out)} — ${meta.width} × ${meta.height}, ${(size / 1024).toFixed(1)} kB ` +
      `(drawn at ${DISPLAY_W} × ${height / SCALE})`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
