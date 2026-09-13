// The About section's phone, from the UI8 kit "Aganta - Mobile App Landing
// Website UI Kit" (Figma key 54gPLHdsJKLMMubB2NZjk7, node 8803:2881
// "Mockup"): an iPhone 14 Pro "Silver" frame image over a rounded block of a
// gradient photo, with the WalaOne home capture inside. The page rebuilds
// the composition in the DOM (components/ui/AppMockup.tsx) so the capture
// stays a separate per-locale image; this script prepares the two images the
// node itself uses, from its raw fills:
//   frame: Silver.png (1736 × 3528, transparent screen) → 3× the width it is
//          drawn at, WebP with alpha;
//   glow:  54.jpg (3840 × 2160) cropped to the part the node's rounded clip
//          shows, at 2× the block's drawn width, corners baked in.
// Inputs, git-ignored (re-export from Figma when the node changes; the MCP
// download_assets rawImages of the node): .render/figma/about/silver.png and
// .render/figma/about/glow.jpg. Usage: npm run render:about
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const inputDir = path.join(root, '.render/figma/about');
const outDir = path.join(root, 'public/about');

// The node's geometry in its own units (SVG export of 8803:2881, 551 × 740
// viewBox): the frame image rect, the glow's clip rect and the image rect the
// glow photo is drawn into. Mirrored in lib/art.ts (ABOUT_MOCKUP.layout).
const FRAME = { x: 102.745, y: 1.497, w: 345.491, h: 701.587 };
const GLOW_CLIP = { x: 67.391, y: 297.315, w: 415.401, h: 441.916, rx: 32 };
const GLOW_IMAGE = { x: -123, y: 294.621, w: 796, h: 447.75 };
/** the composition is at most this wide on the page (About column) */
const DISPLAY_W = 480;
const COMP_W = 550.186;
const FRAME_SCALE = 3;
const GLOW_SCALE = 2;

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const silver = path.join(inputDir, 'silver.png');
  const glow = path.join(inputDir, 'glow.jpg');
  for (const f of [silver, glow]) {
    if (!fs.existsSync(f)) throw new Error(`${path.relative(root, f)} is missing (see the header)`);
  }

  // frame
  const frameW = Math.round((FRAME.w / COMP_W) * DISPLAY_W * FRAME_SCALE);
  const frameOut = path.join(outDir, 'iphone-14-pro-silver.webp');
  const fi = await sharp(silver)
    .resize({ width: frameW })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(frameOut);
  console.log(
    `${path.relative(root, frameOut)}: ${fi.width} × ${fi.height}, ${(fi.size / 1024).toFixed(0)} kB`,
  );

  // glow: the clip in photo pixels, then the corners
  const meta = await sharp(glow).metadata();
  const sx = meta.width / GLOW_IMAGE.w;
  const sy = meta.height / GLOW_IMAGE.h;
  const region = {
    left: Math.round((GLOW_CLIP.x - GLOW_IMAGE.x) * sx),
    top: Math.round((GLOW_CLIP.y - GLOW_IMAGE.y) * sy),
    width: Math.round(GLOW_CLIP.w * sx),
    height: Math.round(GLOW_CLIP.h * sy),
  };
  const glowW = Math.round((GLOW_CLIP.w / COMP_W) * DISPLAY_W * GLOW_SCALE);
  const glowH = Math.round((glowW * GLOW_CLIP.h) / GLOW_CLIP.w);
  const rx = (GLOW_CLIP.rx / GLOW_CLIP.w) * glowW;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${glowW}" height="${glowH}"><rect width="${glowW}" height="${glowH}" rx="${rx}" fill="#fff"/></svg>`,
  );
  const glowOut = path.join(outDir, 'mockup-glow.webp');
  const gi = await sharp(glow)
    .extract(region)
    .resize({ width: glowW, height: glowH, fit: 'fill' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(glowOut);
  console.log(
    `${path.relative(root, glowOut)}: ${gi.width} × ${gi.height}, ${(gi.size / 1024).toFixed(0)} kB (photo region ${JSON.stringify(region)}, rx ${rx.toFixed(1)})`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
