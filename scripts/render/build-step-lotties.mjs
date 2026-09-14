// The three "How to subscribe" step animations. The sources are the design's
// Neo-Brutalism Lottie set — one per step, chosen for the step it illustrates:
//   step 1  Savings & Budgeting / 9.json        entering your details
//   step 2  Payment Gateway / 6.json            completing the payment
//   step 3  Technology & Digital / 21.json      opening the app
// They arrive in the set's own bright palette (pink, cyan-green, coral, violet),
// which belongs to nothing on this page, so every colour is mapped here to a
// token in styles/tokens.css **by name** — no colour value lives in this file —
// drawing only on the Primary purple and Secondary yellow families the brand
// owns. Two of the source colours only ever paint track mattes, which are never
// visible; they are mapped anyway so an unmapped colour stays an error.
//
// The sources also carry a Duik "Kleaner" rig: every animated property has a
// ~15 kB expression attached, repeated on dozens of properties, which is most
// of the file (step 3 is 600 kB of which ~95 % is expression text). The
// expressions only add follow-through on top of keyframes that are already
// baked, so they are stripped along with the pseudo-effects that feed them.
// That also means the page can keep the light Lottie player.
//
// Inputs, git-ignored: .render/lottie/step{1,2,3}.json
// Usage: npm run render:steps
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const inputDir = path.join(root, '.render/lottie');
const outDir = path.join(root, 'public/lottie');
const tokensCss = path.join(root, 'styles', 'tokens.css');

const STEPS = ['step1', 'step2', 'step3'];

/** source colour (rounded 0–255 rgb) → token name in styles/tokens.css */
const MAP = {
  '0,0,0': 'ink', // every outline
  '255,255,255': 'bg-elevated', // paper, highlights
  '133,62,244': 'brand', // the set's violet → Primary 600
  '254,208,1': 'accent', // the set's yellow → Secondary 500
  '0,218,158': 'card-5', // the set's green → Primary 200
  '247,101,102': 'phone-frame-deep', // the set's coral → Primary 300
  '255,152,225': 'phone-frame-warm', // the set's pink → a Secondary tint
  '255,108,212': 'brand', // track matte only, never painted
  '255,0,0': 'brand', // track matte only, never painted
};

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

function build(name) {
  const src = path.join(inputDir, `${name}.json`);
  if (!fs.existsSync(src))
    throw new Error(`${path.relative(root, src)} is missing (see the header)`);
  const before = fs.statSync(src).size;
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));

  const unmapped = new Set();
  let colours = 0;
  let expressions = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if ((node.ty === 'fl' || node.ty === 'st') && node.c) {
      if (node.c.a !== 0) throw new Error(`${name}: animated colour found, extend the script`);
      const token = MAP[key(node.c.k)];
      if (!token) unmapped.add(key(node.c.k));
      else {
        node.c.k = [...tokenRgb(token), node.c.k[3] ?? 1];
        colours += 1;
      }
    }
    // a Lottie expression is a string property named x on a property object
    if (typeof node.x === 'string' && node.x.includes('$bm_rt')) {
      delete node.x;
      expressions += 1;
    }
    Object.values(node).forEach(walk);
  };
  walk(data.layers);
  // the Duik pseudo-effects existed only to feed those expressions
  for (const layer of data.layers) delete layer.ef;

  if (unmapped.size) {
    throw new Error(`${name}: source colours with no token mapping: ${[...unmapped].join(' | ')}`);
  }
  data.nm = `walaone-howto-${name}`;

  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${name}.json`);
  fs.writeFileSync(out, JSON.stringify(data));
  const after = fs.statSync(out).size;
  console.log(
    `${path.relative(root, out)}: ${data.w} × ${data.h}, ${(after / 1024).toFixed(0)} kB ` +
      `(from ${(before / 1024).toFixed(0)} kB), ${colours} colours mapped, ${expressions} expressions stripped`,
  );
}

try {
  STEPS.forEach(build);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
