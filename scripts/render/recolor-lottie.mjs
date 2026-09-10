// Recolours the headline Lottie to the palette and writes the file the hero
// plays. The source is scripts/render/src/hero-cart.json ("10.json" from the
// "Savings & Budgeting" Lottie pack, untouched): a shopping cart with a coin
// growing out of it. Every colour in it is mapped to a token in
// styles/tokens.css by name, so no colour value lives here, and the strokes
// are thickened so the outlines stay legible at headline size.
//   npm run render:headline
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const src = path.join(here, 'src', 'hero-cart.json');
const out = path.join(root, 'public', 'lottie', 'hero-illustration.json');
const tokensCss = path.join(root, 'styles', 'tokens.css');

/** source colour (rounded 0–255 rgb) → token name */
const MAP = {
  '133,62,244': 'ink-on-dark', // purple outlines → white, like the headline
  '0,0,0': 'ink-on-dark-muted', // black rim, swirl and tag string → Primary 100
  '0,218,158': 'card-5', // teal cart body and leaves → lilac
  '157,219,244': 'brand-wash', // light-blue blobs in the cart → Primary 50
  '247,101,102': 'accent', // coral wheels, coin rim and % tag → CTA yellow
  '254,208,1': 'accent', // coin and stem → CTA yellow
};
/** strokes are 1.17 units on a 256 canvas: ~0.8px at headline size without this */
const STROKE_SCALE = 1.5;

const tokens = new Map();
for (const m of fs
  .readFileSync(tokensCss, 'utf8')
  .matchAll(/--color-([\w-]+):\s*#([0-9a-f]{6})\b/gi)) {
  tokens.set(m[1], m[2]);
}
const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const key = (k) =>
  k
    .slice(0, 3)
    .map((x) => Math.round(x * 255))
    .join(',');

const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const unmapped = new Set();
let colours = 0;
let strokes = 0;
const walk = (node) => {
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if ((node.ty === 'fl' || node.ty === 'st') && node.c) {
    if (node.c.a !== 0) throw new Error('animated colour found: extend the script');
    const token = MAP[key(node.c.k)];
    if (!token) unmapped.add(key(node.c.k));
    else {
      const hex = tokens.get(token);
      if (!hex) throw new Error(`--color-${token} is not in styles/tokens.css`);
      node.c.k = [...rgb(hex), node.c.k[3] ?? 1];
      colours += 1;
    }
  }
  if (node.ty === 'st' && node.w) {
    if (node.w.a !== 0) throw new Error('animated stroke width found: extend the script');
    node.w.k = Math.round(node.w.k * STROKE_SCALE * 1000) / 1000;
    strokes += 1;
  }
  Object.values(node).forEach(walk);
};
walk(data.layers);
if (unmapped.size) {
  throw new Error(`source colours with no token mapping: ${[...unmapped].join(' | ')}`);
}
data.nm = 'walaone-hero-cart';

fs.writeFileSync(out, JSON.stringify(data));
console.log(
  `${path.relative(root, out)}: ${(fs.statSync(out).size / 1024).toFixed(0)} kB, ${colours} colours mapped to tokens, ${strokes} strokes ×${STROKE_SCALE}`,
);
