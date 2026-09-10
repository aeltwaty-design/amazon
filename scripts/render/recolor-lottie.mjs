// Recolours the headline Lottie to the palette and writes the file the hero
// plays. The source is scripts/render/src/hero-megaphone.json (the design-
// supplied "Megaphone Loop": a hand raising a megaphone, two floating discs,
// three sound waves), untouched. Every colour in it is mapped to a token in
// styles/tokens.css by name, so no colour value lives here; the sound waves,
// which share the outline colour in the source, get their own token because
// dark lines vanish on the dark hero surface; strokes are thickened so the
// outlines stay legible at headline size.
//   npm run render:headline
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const src = path.join(here, 'src', 'hero-megaphone.json');
const out = path.join(root, 'public', 'lottie', 'hero-illustration.json');
const tokensCss = path.join(root, 'styles', 'tokens.css');

/** source colour (rounded 0–255 rgb) → token name */
const MAP = {
  '35,35,40': 'ink', // outlines and the dark bell opening
  '110,227,253': 'accent', // cyan rim, handle, grip, inner bell, discs → CTA yellow
  '242,252,255': 'ink-on-dark-muted', // near-white cone, hand, thumb, highlights → Primary 100
};
/** top-level layers whose strokes/fills take a token of their own instead of MAP */
const LAYER_OVERRIDES = [{ match: /^sound wave/i, st: 'accent' }];
/** strokes are 5 units on a 500 canvas: ~1.2px at headline size without this */
const STROKE_SCALE = 1.2;

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
const tokenRgb = (token) => {
  const hex = tokens.get(token);
  if (!hex) throw new Error(`--color-${token} is not in styles/tokens.css`);
  return rgb(hex);
};

const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const unmapped = new Set();
let colours = 0;
let strokes = 0;
const walk = (node, override) => {
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, override));
    return;
  }
  if (!node || typeof node !== 'object') return;
  if ((node.ty === 'fl' || node.ty === 'st') && node.c) {
    if (node.c.a !== 0) throw new Error('animated colour found: extend the script');
    const token = (override && override[node.ty]) || MAP[key(node.c.k)];
    if (!token) unmapped.add(key(node.c.k));
    else {
      node.c.k = [...tokenRgb(token), node.c.k[3] ?? 1];
      colours += 1;
    }
  }
  if (node.ty === 'st' && node.w) {
    if (node.w.a !== 0) throw new Error('animated stroke width found: extend the script');
    node.w.k = Math.round(node.w.k * STROKE_SCALE * 1000) / 1000;
    strokes += 1;
  }
  Object.values(node).forEach((v) => walk(v, override));
};
for (const layer of data.layers) {
  const override = LAYER_OVERRIDES.find((o) => o.match.test(layer.nm ?? '')) ?? null;
  walk(layer, override);
}
if (unmapped.size) {
  throw new Error(`source colours with no token mapping: ${[...unmapped].join(' | ')}`);
}
data.nm = 'walaone-hero-megaphone';

fs.writeFileSync(out, JSON.stringify(data));
console.log(
  `${path.relative(root, out)}: ${(fs.statSync(out).size / 1024).toFixed(0)} kB, ${colours} colours mapped to tokens, ${strokes} strokes ×${STROKE_SCALE}`,
);
