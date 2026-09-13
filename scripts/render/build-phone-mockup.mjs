// The matte iPhone on the first Benefits card, from the Figma community file
// "Matte iPhone Mockups - 2021 Updated" (key Jdseo7zT9YXYYms1gcm1ot, node
// 55977:6896: the "[Template] iPhone 13" device with the WalaOne map screen
// placed in it). Figma's PNG export composes the matte shading correctly but
// bakes the page background and the drop shadow in, so this script:
//   1. cuts the phone out with its own silhouette path (the template's
//      "[Change this color]" path from the SVG export, kept with the screen
//      mask in src/phone-mockup.json),
//   2. recolours the body — inside the silhouette, outside the screen — from
//      the template's light blue to --color-phone-frame, in OKLab so the
//      matte shading and the neutral details (speaker slit, camera) survive;
//      the target is a token NAME, so no colour literal lives here,
//   3. keeps the top three quarters (what the card shows) and writes
//      public/mockups/points-phone.webp, printing the size for lib/art.ts.
// Input, git-ignored (re-export when the Figma node changes): the Figma MCP
// download_assets PNG export of the node at scale 2, saved as
// .render/figma/phone-mockup@2x.png. Usage: npm run render:phone [-- export.png]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const input = process.argv[2] ?? path.join(root, '.render/figma/phone-mockup@2x.png');
const geometryPath = path.join(root, 'scripts/render/src/phone-mockup.json');
const tokensCss = path.join(root, 'styles/tokens.css');
const outDir = path.join(root, 'public/mockups');
const masterDir = path.join(root, '.render/mockups');
const NAME = 'points-phone';
const BODY_TOKEN = 'phone-frame';
/** share of the phone's height the card shows, from the top */
const VISIBLE = 3 / 4;
const WEBP = { quality: 82, alphaQuality: 90, effort: 6 };
const FALLBACK_QUALITY = 78;
const BUDGET = 220 * 1024;
/** a body pixel must be within this hue distance of the body's key colour (radians) */
const HUE_TOL = (35 * Math.PI) / 180;
/** …and carry at least this share of the key chroma, or it is a neutral detail */
const CHROMA_FLOOR = 0.5;

// ---------- tokens: values by name, never literals ----------
function readTokens() {
  const tokens = new Map();
  for (const m of fs
    .readFileSync(tokensCss, 'utf8')
    .matchAll(/--color-([\w-]+):\s*#([0-9a-f]{6})\b/gi)) {
    tokens.set(m[1], m[2].toLowerCase());
  }
  return tokens;
}

// ---------- OKLab (Björn Ottosson), sRGB 0..1 in and out ----------
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function rgbToOklab(r, g, b) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => clamp01(toSrgb(clamp01(c))));
}

const hexToRgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const rgbToHex = (rgb) =>
  rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const hueDistance = (a, b) => {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
};

// ---------- masks from the SVG paths ----------
async function rasterMask(d, box, scale) {
  const [x, y, w, h] = box;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w * scale}" height="${h * scale}"><path d="${d}" fill="#fff" fill-rule="evenodd"/></svg>`;
  const { data } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

async function main() {
  const tokens = readTokens();
  const bodyHex = tokens.get(BODY_TOKEN);
  if (!bodyHex) throw new Error(`--color-${BODY_TOKEN} is not in styles/tokens.css`);
  if (!fs.existsSync(input)) {
    throw new Error(
      `${path.relative(root, input)} is missing: export Figma node 55977:6896 as PNG at scale 2 (see the header) and save it there`,
    );
  }
  const geometry = JSON.parse(fs.readFileSync(geometryPath, 'utf8'));
  const [, , vbW, vbH] = geometry.viewBox;
  const [bx, by, bw, bh] = geometry.bbox;

  const png = sharp(input);
  const meta = await png.metadata();
  // Figma rounds the node's fractional size per axis (886.048 × 2 → 1773), so
  // the scale is the nearest integer and the export may be a pixel short.
  const scale = Math.round(meta.width / vbW);
  if (
    scale < 1 ||
    Math.abs(meta.width - vbW * scale) > 2 ||
    Math.abs(meta.height - vbH * scale) > 2
  ) {
    throw new Error(
      `${path.relative(root, input)} is ${meta.width} × ${meta.height}; expected the ${vbW} × ${vbH} node at an integer scale (2 → about 1773 × 2708)`,
    );
  }
  // The exporter's page background: the corner pixel, not a literal.
  const corner = await png
    .clone()
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer();
  const bg = [corner[0], corner[1], corner[2]].map((c) => c / 255);

  const W = bw * scale;
  const H = bh * scale;
  const { data } = await png
    .clone()
    .extract({ left: bx * scale, top: by * scale, width: W, height: H })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const phone = await rasterMask(geometry.phone.d, geometry.bbox, scale);
  const screen = await rasterMask(geometry.screen.d, geometry.bbox, scale);

  // Pass 1: cut out, decontaminate the anti-aliased rim against the
  // background, and gather the body's OKLab statistics.
  const lab = new Float32Array(W * H * 3);
  const bodyIdx = [];
  for (let i = 0, p = 0; i < W * H; i++, p += 4) {
    const a = phone[i];
    if (a === 0) {
      data[p] = data[p + 1] = data[p + 2] = data[p + 3] = 0;
      continue;
    }
    const alpha = a / 255;
    let r = data[p] / 255;
    let g = data[p + 1] / 255;
    let b = data[p + 2] / 255;
    if (a < 255) {
      r = clamp01((r - (1 - alpha) * bg[0]) / alpha);
      g = clamp01((g - (1 - alpha) * bg[1]) / alpha);
      b = clamp01((b - (1 - alpha) * bg[2]) / alpha);
    }
    const [L, A, B] = rgbToOklab(r, g, b);
    lab[i * 3] = L;
    lab[i * 3 + 1] = A;
    lab[i * 3 + 2] = B;
    data[p + 3] = a;
    if (a === 255 && screen[i] === 0) bodyIdx.push(i);
  }
  if (bodyIdx.length === 0) throw new Error('the silhouette mask matched no opaque pixels');

  // The key colour: the mean of the chromatic body pixels (the neutral slit
  // and camera fall below half the median chroma and are left out).
  const chroma = bodyIdx.map((i) => Math.hypot(lab[i * 3 + 1], lab[i * 3 + 2]));
  const medianC = [...chroma].sort((x, y) => x - y)[Math.floor(chroma.length / 2)];
  let kL = 0;
  let kA = 0;
  let kB = 0;
  let kN = 0;
  bodyIdx.forEach((i, j) => {
    if (chroma[j] < CHROMA_FLOOR * medianC) return;
    kL += lab[i * 3];
    kA += lab[i * 3 + 1];
    kB += lab[i * 3 + 2];
    kN++;
  });
  kL /= kN;
  kA /= kN;
  kB /= kN;
  const kC = Math.hypot(kA, kB);
  const kH = Math.atan2(kB, kA);
  const [tL, tA, tB] = rgbToOklab(...hexToRgb(bodyHex));
  const tC = Math.hypot(tA, tB);
  const tH = Math.atan2(tB, tA);

  // Pass 2: recolour the body. Lightness keeps its shading (shifted so the
  // flat body lands on the token), chroma scales with the pixel's own, hue is
  // the token's; the weight fades out for neutral pixels and at the screen's
  // anti-aliased edge, which keeps the map untouched.
  let oL = 0;
  let oA = 0;
  let oB = 0;
  let oN = 0;
  for (let i = 0, p = 0; i < W * H; i++, p += 4) {
    if (phone[i] === 0 || screen[i] === 255) continue;
    const L = lab[i * 3];
    const A = lab[i * 3 + 1];
    const B = lab[i * 3 + 2];
    const C = Math.hypot(A, B);
    const w =
      clamp01(1 - hueDistance(Math.atan2(B, A), kH) / HUE_TOL) *
      clamp01(C / (CHROMA_FLOOR * kC)) *
      (1 - screen[i] / 255);
    if (w === 0) continue;
    const nL = L + (tL - kL);
    const nC = tC * (C / kC);
    const nA = nC * Math.cos(tH);
    const nB = nC * Math.sin(tH);
    const mL = w * nL + (1 - w) * L;
    const mA = w * nA + (1 - w) * A;
    const mB = w * nB + (1 - w) * B;
    const [r, g, b] = oklabToRgb(mL, mA, mB);
    data[p] = Math.round(r * 255);
    data[p + 1] = Math.round(g * 255);
    data[p + 2] = Math.round(b * 255);
    if (w > 0.9 && phone[i] === 255) {
      oL += mL;
      oA += mA;
      oB += mB;
      oN++;
    }
  }
  const dE = 100 * Math.hypot(oL / oN - tL, oA / oN - tA, oB / oN - tB);
  if (dE > 2) throw new Error(`recoloured body is ΔE ${dE.toFixed(2)} from --color-${BODY_TOKEN}`);

  // Self-checks: the crop's corners lie outside the rounded silhouette, and
  // the screen is the export's pixels.
  const cornerAlpha = [0, W - 1, (H - 1) * W, H * W - 1].map((i) => data[i * 4 + 3]);
  if (cornerAlpha.some((a) => a !== 0)) throw new Error(`corners not transparent: ${cornerAlpha}`);
  const sc = Math.floor(H / 2) * W + Math.floor(W / 2);
  const original = await png
    .clone()
    .extract({
      left: bx * scale + Math.floor(W / 2),
      top: by * scale + Math.floor(H / 2),
      width: 1,
      height: 1,
    })
    .raw()
    .toBuffer();
  if (screen[sc] !== 255 || data[sc * 4] !== original[0] || data[sc * 4 + 1] !== original[1]) {
    throw new Error('the screen centre changed');
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(masterDir, { recursive: true });
  const full = sharp(data, { raw: { width: W, height: H, channels: 4 } });
  await full
    .clone()
    .png()
    .toFile(path.join(masterDir, `${NAME}.png`));
  const visibleH = Math.round(H * VISIBLE);
  const cropped = full.clone().extract({ left: 0, top: 0, width: W, height: visibleH });
  let quality = WEBP.quality;
  let buf = await cropped.clone().webp(WEBP).toBuffer();
  if (buf.length > BUDGET) {
    quality = FALLBACK_QUALITY;
    buf = await cropped
      .clone()
      .webp({ ...WEBP, quality })
      .toBuffer();
  }
  const outPath = path.join(outDir, `${NAME}.webp`);
  fs.writeFileSync(outPath, buf);
  console.log(
    `${path.relative(root, outPath)}: ${W} × ${visibleH} (top ${Math.round(VISIBLE * 100)}% of the ${W} × ${H} phone at ${scale}×), ${(buf.length / 1024).toFixed(0)} kB at q${quality}; body #${rgbToHex(oklabToRgb(kL, kA, kB))} → --color-${BODY_TOKEN} #${bodyHex} (ΔE ${dE.toFixed(2)}); master ${path.relative(root, masterDir)}/${NAME}.png`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
