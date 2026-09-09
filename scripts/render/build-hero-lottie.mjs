// Builds public/lottie/hero-illustration.json from the three hero sprites
// rendered by render.mjs (hero-phone, hero-coin, hero-card): the co-branded
// phone bobs while a coin and an Amazon × WalaOne card float around it.
// Sprites are embedded as base64 WebP so the Lottie is one self-contained file.
//   node scripts/render/build-hero-lottie.mjs [spriteDir]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const spriteDir = process.argv[2] || path.join(root, 'public', 'illustrations');
const out = path.join(root, 'public', 'lottie', 'hero-illustration.json');

const W = 350;
const H = 200;
const FR = 30;
const OP = 150; // 5 s loop

// Sprites are shipped at half their render size: the hero art box is ~120 CSS
// px wide, so 180 px sprites are still ≥ 2× on a retina display.
async function asset(id, file, scale) {
  const buf = fs.readFileSync(path.join(spriteDir, file));
  const meta = await sharp(buf).metadata();
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const webp = await sharp(buf).resize(w, h).webp({ quality: 90, alphaQuality: 95 }).toBuffer();
  return { id, w, h, u: '', p: `data:image/webp;base64,${webp.toString('base64')}`, e: 1 };
}

const ease = { i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } };
const ease3 = {
  i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
  o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
};

// A seamless sine-like loop: value goes a → b → a over OP frames, offset by `phase` frames.
const bob = (a, b, phase = 0) => {
  const k = [];
  const half = OP / 2;
  const seq = [a, b, a];
  for (let i = 0; i < 3; i++) k.push({ t: i * half, s: [seq[i]], ...ease });
  if (phase) {
    // Shift the whole curve by resampling at the phase offset; three keys keep it cheap.
    const at = (t) => {
      const u = ((t + phase) % OP) / OP;
      return a + ((b - a) * (1 - Math.cos(u * Math.PI * 2))) / 2;
    };
    return {
      a: 1,
      k: [0, OP / 4, OP / 2, (3 * OP) / 4, OP].map((t) => ({ t, s: [at(t)], ...ease })),
    };
  }
  return { a: 1, k };
};
const bobXY = (x, ya, yb, phase = 0) => {
  const y = bob(ya, yb, phase);
  return { a: 1, k: y.k.map((f) => ({ t: f.t, s: [x, f.s[0], 0], ...ease3 })) };
};

const layer = (ind, refId, a, { p, r, s }) => ({
  ddd: 0,
  ind,
  ty: 2,
  nm: refId,
  refId,
  sr: 1,
  ks: {
    o: { a: 0, k: 100 },
    r,
    p,
    a: { a: 0, k: [a.w / 2, a.h / 2, 0] },
    s: { a: 0, k: [s, s, 100] },
  },
  ao: 0,
  ip: 0,
  op: OP,
  st: 0,
  bm: 0,
});

const phone = await asset('phone', 'hero-phone.webp', 0.5);
const coin = await asset('coin', 'hero-coin.webp', 0.5);
const card = await asset('card', 'hero-card.webp', 0.5);

// Comp-space sizes: phone ≈ 104 × 186, coin ≈ 56, card ≈ 100 × 69.
const phoneScale = (186 / phone.h) * 100;
const coinScale = (56 / coin.h) * 100;
const cardScale = (100 / card.w) * 100;

const lottie = {
  v: '5.7.4',
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'walaone-amazon-hero',
  ddd: 0,
  assets: [phone, coin, card],
  layers: [
    layer(1, 'coin', coin, {
      p: bobXY(78, 62, 50, 40),
      r: bob(-14, 10, 20),
      s: coinScale,
    }),
    layer(2, 'phone', phone, {
      p: bobXY(175, 103, 95),
      r: bob(-2.5, 2.5),
      s: phoneScale,
    }),
    layer(3, 'card', card, {
      p: bobXY(278, 122, 132, 70),
      r: bob(6, -4, 30),
      s: cardScale,
    }),
  ],
  markers: [],
};

fs.writeFileSync(out, JSON.stringify(lottie));
console.log(`${path.relative(root, out)}: ${(fs.statSync(out).size / 1024).toFixed(0)} kB`);
