// Browser-side scene library for scripts/render/render.mjs. Runs inside
// headless Chromium with Three.js from the import map the driver writes.
// Every scene is a soft "clay" 3D still in the WalaOne palette, rendered on a
// transparent background with a tinted contact shadow.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const C = {
  purple: '#755BD8',
  purpleDeep: '#5B44B8',
  purpleDark: '#403277',
  lilac: '#D9D2F4',
  lilacLight: '#F1EFFB',
  yellow: '#FAC333',
  yellowDeep: '#E0A614',
  white: '#FFFFFF',
  ink: '#22252E',
  orange: '#FF9900',
  green: '#22A06B',
};

const clay = (color, o = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0, ...o });
const gold = (color = C.yellow) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.55 });
const gloss = (color) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  });

const shadowed = (m) => {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};
const mesh = (geo, mat) => shadowed(new THREE.Mesh(geo, mat));

// ---------- geometry helpers ----------
const rbox = (w, h, d, r, mat, seg = 6) => mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat);

const extrude = (shape, depth, mat, bevel = 0.02) =>
  mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 24,
    }).center(),
    mat,
  );

const roundedRect = (w, h, r) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const starShape = (outer, inner, points = 5) => {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / points;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
};

export function star(size = 0.5, mat = clay(C.purple), depth = 0.16) {
  return extrude(starShape(size, size * 0.46), depth, mat, 0.03);
}
export function sparkle(size = 0.2, mat = gold()) {
  return extrude(starShape(size, size * 0.18, 4), size * 0.25, mat, size * 0.05);
}

export function coin(r = 0.5, t = 0.12) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r, r, t, 64), gold()));
  const ring = mesh(new THREE.TorusGeometry(r * 0.76, t * 0.22, 12, 64), gold(C.yellowDeep));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = t / 2;
  g.add(ring);
  const ring2 = ring.clone();
  ring2.position.y = -t / 2;
  g.add(ring2);
  return g;
}

export function bag(w = 1.1, h = 1.3, d = 0.6) {
  const g = new THREE.Group();
  g.add(rbox(w, h, d, 0.08, clay(C.purple)));
  const hGeo = new THREE.TorusGeometry(w * 0.3, 0.045, 12, 48, Math.PI);
  for (const z of [-d * 0.28, d * 0.28]) {
    const handle = mesh(hGeo, gold());
    handle.position.set(0, h / 2 - 0.02, z);
    g.add(handle);
  }
  const st = star(0.22, gold(), 0.05);
  st.position.set(0, h * 0.05, d / 2 + 0.03);
  g.add(st);
  return g;
}

export function tag(mat = clay(C.white)) {
  const s = new THREE.Shape();
  s.moveTo(-0.6, -0.35);
  s.lineTo(0.3, -0.35);
  s.lineTo(0.68, 0);
  s.lineTo(0.3, 0.35);
  s.lineTo(-0.6, 0.35);
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0.44, 0, 0.08, 0, Math.PI * 2, false);
  s.holes.push(hole);
  const g = new THREE.Group();
  g.add(extrude(s, 0.06, mat, 0.02));
  return g;
}

// A standing envelope with the classic V flap on its front face; whatever is
// added to the returned group at z≈0 above y=0.5 looks like it slides out of it.
export function envelope() {
  const g = new THREE.Group();
  g.add(rbox(1.5, 1.0, 0.14, 0.06, clay(C.white)));
  const flap = new THREE.Shape();
  flap.moveTo(-0.72, 0.47);
  flap.lineTo(0.72, 0.47);
  flap.lineTo(0, -0.12);
  flap.closePath();
  const f = extrude(flap, 0.02, clay(C.lilacLight), 0.008);
  f.position.set(0, 0.175, 0.09);
  g.add(f);
  const seal = mesh(new THREE.SphereGeometry(0.075, 24, 16), clay(C.purple));
  seal.position.set(0, -0.16, 0.1);
  g.add(seal);
  return g;
}

export function codeCard() {
  const g = new THREE.Group();
  g.add(rbox(1.25, 0.8, 0.06, 0.08, clay(C.white)));
  for (let i = 0; i < 6; i++) {
    const cube = rbox(0.13, 0.18, 0.06, 0.03, i < 4 ? gold() : clay(C.lilac));
    cube.position.set(-0.45 + i * 0.18, -0.08, 0.05);
    g.add(cube);
  }
  const line = rbox(0.6, 0.07, 0.03, 0.02, clay(C.lilac));
  line.position.set(-0.15, 0.22, 0.045);
  g.add(line);
  return g;
}

export function creditCard() {
  const g = new THREE.Group();
  g.add(rbox(1.7, 1.05, 0.06, 0.1, gloss(C.purple)));
  const chip = rbox(0.28, 0.22, 0.03, 0.04, gold());
  chip.position.set(-0.5, 0.15, 0.04);
  g.add(chip);
  for (let i = 0; i < 3; i++) {
    const line = rbox(0.28, 0.06, 0.02, 0.015, clay(C.white));
    line.position.set(-0.52 + i * 0.38, -0.28, 0.04);
    g.add(line);
  }
  const st = star(0.13, gold(), 0.03);
  st.position.set(0.6, 0.3, 0.04);
  g.add(st);
  return g;
}

export function lock() {
  const g = new THREE.Group();
  g.add(rbox(0.8, 0.65, 0.42, 0.12, gold()));
  const arc = mesh(new THREE.TorusGeometry(0.24, 0.065, 16, 40, Math.PI), gold(C.yellowDeep));
  arc.position.y = 0.42;
  g.add(arc);
  for (const x of [-0.24, 0.24]) {
    const leg = mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.22, 24), gold(C.yellowDeep));
    leg.position.set(x, 0.33, 0);
    g.add(leg);
  }
  const key = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 32), clay(C.purple));
  key.rotation.x = Math.PI / 2;
  key.position.set(0, 0.06, 0.21);
  const slot = rbox(0.08, 0.18, 0.05, 0.02, clay(C.purple));
  slot.position.set(0, -0.08, 0.21);
  g.add(key, slot);
  return g;
}

export function checkBadge(r = 0.32, color = C.purple) {
  const g = new THREE.Group();
  const disc = mesh(new THREE.CylinderGeometry(r, r, r * 0.45, 48), clay(color));
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const s = new THREE.Shape();
  [
    [0.05, 0.5],
    [0.18, 0.62],
    [0.4, 0.4],
    [0.78, 0.78],
    [0.92, 0.64],
    [0.4, 0.12],
  ].forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  s.closePath();
  const ck = extrude(s, 0.05, clay(C.white), 0.01);
  ck.scale.setScalar(r * 1.15);
  ck.position.z = r * 0.225 + 0.03;
  g.add(ck);
  return g;
}

export function pill() {
  const g = new THREE.Group();
  g.add(rbox(1.3, 0.42, 0.14, 0.2, clay(C.white)));
  const dot = mesh(new THREE.SphereGeometry(0.11, 24, 16), gold());
  dot.position.set(-0.42, 0, 0.08);
  g.add(dot);
  const l1 = rbox(0.55, 0.06, 0.03, 0.02, clay(C.purple));
  l1.position.set(0.05, 0.07, 0.08);
  const l2 = rbox(0.4, 0.05, 0.03, 0.02, clay(C.lilac));
  l2.position.set(-0.02, -0.08, 0.08);
  g.add(l1, l2);
  return g;
}

// ---------- sector tile props ----------
export function burger() {
  const g = new THREE.Group();
  const bun = clay(C.yellowDeep);
  const bottom = mesh(new THREE.CylinderGeometry(0.5, 0.46, 0.18, 48), bun);
  const patty = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 48), clay(C.ink));
  patty.position.y = 0.16;
  const cheese = rbox(0.98, 0.04, 0.98, 0.01, gold());
  cheese.position.y = 0.25;
  cheese.rotation.y = 0.5;
  const lettuce = mesh(new THREE.TorusGeometry(0.46, 0.07, 12, 48), clay(C.green));
  lettuce.rotation.x = Math.PI / 2;
  lettuce.position.y = 0.3;
  const top = mesh(new THREE.SphereGeometry(0.52, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), bun);
  top.position.y = 0.34;
  top.scale.y = 0.62;
  g.add(bottom, patty, cheese, lettuce, top);
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.3;
    const d = 0.18 + (i % 3) * 0.09;
    const seed = mesh(new THREE.SphereGeometry(0.035, 12, 8), clay(C.white));
    seed.position.set(
      Math.cos(a) * d,
      0.34 + 0.62 * Math.sqrt(0.52 * 0.52 - d * d),
      Math.sin(a) * d,
    );
    g.add(seed);
  }
  return g;
}

export function suitcase() {
  const g = new THREE.Group();
  g.add(rbox(1.1, 1.4, 0.5, 0.12, gloss(C.purple), 8));
  const handle = mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 32, Math.PI), gold());
  handle.position.y = 0.72;
  g.add(handle);
  const band = rbox(1.12, 0.12, 0.52, 0.02, gold());
  band.position.y = 0.1;
  g.add(band);
  const badge = rbox(0.3, 0.2, 0.04, 0.03, clay(C.white));
  badge.position.set(-0.25, 0.42, 0.26);
  g.add(badge);
  for (const x of [-0.35, 0.35]) {
    const wheel = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 24), clay(C.ink));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, -0.72, 0);
    g.add(wheel);
  }
  return g;
}

export function plane() {
  const g = new THREE.Group();
  const body = mesh(new THREE.CapsuleGeometry(0.16, 0.9, 8, 24), clay(C.white));
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const wing = rbox(0.42, 0.04, 1.3, 0.02, clay(C.white));
  wing.position.x = 0.02;
  g.add(wing);
  const fin = rbox(0.28, 0.32, 0.04, 0.02, clay(C.purple));
  fin.position.set(-0.55, 0.2, 0);
  const tail = rbox(0.24, 0.03, 0.5, 0.02, clay(C.purple));
  tail.position.set(-0.55, 0.02, 0);
  g.add(fin, tail);
  for (let i = 0; i < 3; i++) {
    const win = mesh(new THREE.SphereGeometry(0.035, 12, 8), clay(C.purple));
    win.position.set(0.05 + i * 0.16, 0.05, 0.155);
    g.add(win);
  }
  return g;
}

export function popcorn() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.9, 48), clay(C.white)));
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const stripe = rbox(0.09, 0.84, 0.04, 0.01, clay(C.purple));
    stripe.position.set(Math.cos(a) * 0.365, 0, Math.sin(a) * 0.365);
    stripe.rotation.set(0.11, Math.PI / 2 - a, 0, 'YXZ');
    g.add(stripe);
  }
  const kernels = [
    C.white,
    C.lilacLight,
    C.yellow,
    C.white,
    C.lilacLight,
    C.white,
    C.yellow,
    C.white,
    C.lilacLight,
    C.white,
  ];
  kernels.forEach((color, i) => {
    const a = i * 1.9;
    const d = i < 4 ? 0.12 : 0.28;
    const k = mesh(new THREE.SphereGeometry(0.11 + (i % 3) * 0.02, 20, 14), clay(color));
    k.position.set(Math.cos(a) * d, 0.52 + (i < 4 ? 0.12 : 0) - (i % 2) * 0.03, Math.sin(a) * d);
    k.scale.set(1, 0.85, 1.1);
    g.add(k);
  });
  return g;
}

// The classic three.js heart shape, drawn tip-up and turned over.
export function heart(size = 0.6, mat = clay(C.purple)) {
  const s = new THREE.Shape();
  const x = -0.8;
  const y = -0.95;
  s.moveTo(x + 0.5, y + 0.5);
  s.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  s.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  s.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  s.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  s.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
  s.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
  const h = extrude(s, 0.3, mat, 0.05);
  h.rotation.z = Math.PI;
  h.scale.setScalar(size);
  return h;
}

export function firstAid() {
  const g = new THREE.Group();
  g.add(rbox(1.0, 0.8, 0.45, 0.1, clay(C.white), 8));
  const handle = mesh(new THREE.TorusGeometry(0.16, 0.04, 10, 24, Math.PI), clay(C.lilac));
  handle.position.y = 0.42;
  g.add(handle);
  const bar1 = rbox(0.42, 0.13, 0.06, 0.03, clay(C.purple));
  bar1.position.z = 0.24;
  const bar2 = rbox(0.13, 0.42, 0.06, 0.03, clay(C.purple));
  bar2.position.z = 0.24;
  g.add(bar1, bar2);
  return g;
}

export function phone(screenTex, w = 1, h = 2.1, d = 0.1) {
  const g = new THREE.Group();
  g.add(rbox(w, h, d, 0.16, gloss(C.ink), 8));
  const screen = new THREE.Mesh(
    shapeGeo(roundedRect(w - 0.08, h - 0.08, 0.12)),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
  );
  screen.position.z = d / 2 + 0.002;
  g.add(screen);
  return g;
}

export function tile(tex, size = 1.4, depth = 0.24) {
  const g = new THREE.Group();
  g.add(rbox(size, size, depth, 0.16, clay(C.white), 8));
  const face = new THREE.Mesh(
    shapeGeo(roundedRect(size - 0.06, size - 0.06, 0.13)),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
  );
  face.position.z = depth / 2 + 0.002;
  g.add(face);
  return g;
}

// ---------- textures ----------
export const canvasTexture = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
};

// ShapeGeometry UVs are in world units, so a texture on a rounded rect needs
// a UV remap into 0..1 across the shape's bounding box.
const remapUv = (geo) => {
  geo.computeBoundingBox();
  const b = geo.boundingBox;
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (uv.getX(i) - b.min.x) / (b.max.x - b.min.x),
      (uv.getY(i) - b.min.y) / (b.max.y - b.min.y),
    );
  }
  uv.needsUpdate = true;
  return geo;
};
const shapeGeo = (shape) => remapUv(new THREE.ShapeGeometry(shape, 24));

// The co-branded app screen: purple gradient, WalaOne mark, an "offer" card
// carrying the Amazon smile, a yellow points chip, a bottom nav. No text so
// the same render serves both locales.
export function drawAppScreen(ctx, w, h, img) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#6A53C5');
  g.addColorStop(1, '#3B2D74');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  rr(ctx, w * 0.08, h * 0.03, w * 0.12, h * 0.012, 4);
  rr(ctx, w * 0.78, h * 0.03, w * 0.14, h * 0.012, 4);
  const mw = w * 0.3;
  const mh = mw * (32 / 38);
  ctx.drawImage(img.markWhite, (w - mw) / 2, h * 0.08, mw, mh);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  rr(ctx, w * 0.28, h * 0.08 + mh + h * 0.03, w * 0.44, h * 0.02, 8);
  // points chip
  ctx.fillStyle = C.yellow;
  rr(ctx, w * 0.08, h * 0.24, w * 0.84, h * 0.11, w * 0.06);
  ctx.fillStyle = '#1C1F26';
  rr(ctx, w * 0.14, h * 0.27, w * 0.3, h * 0.022, 6);
  rr(ctx, w * 0.14, h * 0.305, w * 0.44, h * 0.03, 6);
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.295, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Amazon offer card
  ctx.fillStyle = '#FFFFFF';
  rr(ctx, w * 0.08, h * 0.38, w * 0.84, h * 0.22, w * 0.06);
  const sw = w * 0.42;
  const sh = sw * (85 / 335);
  ctx.drawImage(img.smile, w * 0.14, h * 0.41, sw, sh);
  ctx.fillStyle = '#D9D2F4';
  rr(ctx, w * 0.14, h * 0.49, w * 0.5, h * 0.022, 6);
  rr(ctx, w * 0.14, h * 0.525, w * 0.34, h * 0.022, 6);
  ctx.fillStyle = C.purple;
  rr(ctx, w * 0.62, h * 0.53, w * 0.24, h * 0.045, 20);
  // second row of tiles
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  rr(ctx, w * 0.08, h * 0.64, w * 0.4, h * 0.16, w * 0.05);
  rr(ctx, w * 0.52, h * 0.64, w * 0.4, h * 0.16, w * 0.05);
  ctx.fillStyle = C.yellow;
  rr(ctx, w * 0.14, h * 0.69, w * 0.14, h * 0.05, 8);
  ctx.fillStyle = '#FFFFFF';
  rr(ctx, w * 0.58, h * 0.69, w * 0.14, h * 0.05, 8);
  // bottom nav
  ctx.fillStyle = '#FFFFFF';
  rr(ctx, 0, h * 0.9, w, h * 0.1, 0);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? C.purple : '#D9D2F4';
    ctx.beginPath();
    ctx.arc(w * (0.18 + i * 0.213), h * 0.95, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1C1F26';
  rr(ctx, w * 0.36, h * 0.985, w * 0.28, h * 0.008, 4);
}

const text3d = (font, str, size, depth, mat) =>
  mesh(
    new TextGeometry(str, {
      font,
      size,
      depth,
      bevelEnabled: true,
      bevelSize: size * 0.03,
      bevelThickness: size * 0.03,
      curveSegments: 12,
    }).center(),
    mat,
  );

// ---------- scenes ----------
// Each scene returns a THREE.Group. `img` holds decoded brand images, `font`
// the loaded typeface. Coordinates are in "clay units": ~1 = a hero object.
export const SCENES = {
  rate: {
    w: 420,
    h: 340,
    dir: [0.55, 0.75, 1.7],
    pad: 1.03,
    build({ font }) {
      const g = new THREE.Group();
      const plate = rbox(2.3, 1.25, 0.16, 0.18, clay(C.white), 8);
      plate.rotation.set(-0.35, 0.25, 0.08);
      g.add(plate);
      const txt = text3d(font, '40%', 0.62, 0.14, clay(C.purple));
      txt.position.set(0.04, 0.12, 0.35);
      txt.rotation.set(-0.35, 0.25, 0.08);
      g.add(txt);
      const c = coin(0.34, 0.1);
      c.position.set(1.15, 0.75, 0.3);
      c.rotation.set(0.5, 0.3, -0.4);
      g.add(c);
      const s1 = sparkle(0.16);
      s1.position.set(-1.25, 0.85, 0.25);
      s1.rotation.z = 0.2;
      const s2 = sparkle(0.1);
      s2.position.set(1.05, -0.55, 0.8);
      g.add(s1, s2);
      return g;
    },
  },
  step1: {
    w: 640,
    h: 400,
    dir: [0.7, 0.7, 1.7],
    pad: 1.03,
    build() {
      const g = new THREE.Group();
      const env = envelope();
      env.position.set(-0.35, 0, 0);
      env.rotation.set(-0.08, 0.35, 0);
      g.add(env);
      const card = codeCard();
      card.position.set(0.04, 0.62, 0);
      card.rotation.z = 0.05;
      env.add(card);
      const badge = checkBadge(0.3);
      badge.position.set(1.05, -0.12, 0.6);
      badge.rotation.set(0.05, -0.3, 0.1);
      g.add(badge);
      const s1 = sparkle(0.14);
      s1.position.set(-1.45, 0.95, 0.1);
      const s2 = sparkle(0.09, clay(C.white));
      s2.position.set(1.05, 1.05, -0.2);
      g.add(s1, s2);
      return g;
    },
  },
  step2: {
    w: 640,
    h: 400,
    dir: [0.75, 0.75, 1.7],
    pad: 1.03,
    build() {
      const g = new THREE.Group();
      const card = creditCard();
      card.position.set(-0.3, 0.15, 0);
      card.rotation.set(-0.5, 0.3, 0.1);
      g.add(card);
      const lk = lock();
      lk.position.set(1.05, -0.25, 0.75);
      lk.rotation.y = -0.35;
      g.add(lk);
      const c = coin(0.32, 0.1);
      c.position.set(-1.35, -0.35, 0.75);
      c.rotation.set(0.5, 0.3, -0.5);
      g.add(c);
      const badge = checkBadge(0.26, C.green);
      badge.position.set(0.95, 0.85, -0.1);
      badge.rotation.set(0.1, -0.25, 0.08);
      g.add(badge);
      const s1 = sparkle(0.13);
      s1.position.set(-1.35, 0.95, -0.2);
      g.add(s1);
      return g;
    },
  },
  step3: {
    w: 640,
    h: 400,
    dir: [0.75, 0.55, 1.7],
    pad: 1.02,
    build({ img }) {
      const g = new THREE.Group();
      const tex = canvasTexture(360, 760, (ctx, w, h) => drawAppScreen(ctx, w, h, img));
      const ph = phone(tex, 1.05, 2.15, 0.11);
      ph.position.set(-0.15, 0, 0);
      ph.rotation.set(0.05, -0.35, 0.05);
      g.add(ph);
      const p = pill();
      p.position.set(1.0, 0.75, 0.55);
      p.rotation.set(0, -0.3, 0.06);
      g.add(p);
      const st = star(0.24, gold(), 0.1);
      st.position.set(-1.15, 0.85, 0.2);
      st.rotation.set(0.2, 0.4, 0.3);
      g.add(st);
      const c = coin(0.26, 0.09);
      c.position.set(0.9, -0.6, 0.85);
      c.rotation.set(0.5, 0.2, -0.4);
      g.add(c);
      const s1 = sparkle(0.11);
      s1.position.set(-1.05, -0.35, 0.6);
      const s2 = sparkle(0.09, clay(C.white));
      s2.position.set(1.35, 0.05, -0.2);
      g.add(s1, s2);
      return g;
    },
  },
  // Hero sprites: one object each, framed tight, animated later by the Lottie.
  'hero-phone': {
    w: 360,
    h: 640,
    dir: [0.35, 0.25, 1.9],
    pad: 1.0,
    shadow: false,
    build({ img }) {
      const tex = canvasTexture(360, 760, (ctx, w, h) => drawAppScreen(ctx, w, h, img));
      const ph = phone(tex, 1.05, 2.15, 0.11);
      ph.rotation.set(0, -0.3, 0);
      return ph;
    },
  },
  'hero-coin': {
    w: 220,
    h: 220,
    dir: [0.4, 0.5, 1.8],
    pad: 1.0,
    shadow: false,
    build() {
      const c = coin(0.5, 0.13);
      c.rotation.set(0.9, 0.3, -0.4);
      return c;
    },
  },
  'hero-card': {
    w: 320,
    h: 220,
    dir: [0.3, 0.6, 1.8],
    pad: 1.0,
    shadow: false,
    build({ img }) {
      const g = new THREE.Group();
      g.add(rbox(1.7, 1.05, 0.07, 0.1, clay(C.white), 8));
      const faceTex = canvasTexture(512, 320, (ctx, w, h) => {
        const s = w * 0.55;
        const sh = s * (85 / 335);
        ctx.drawImage(img.smile, w * 0.08, h * 0.12, s, sh);
        const m = w * 0.16;
        const mh = m * (32 / 38);
        ctx.drawImage(img.mark, w * 0.76, h * 0.62, m, mh);
        ctx.fillStyle = '#D9D2F4';
        rr(ctx, w * 0.08, h * 0.62, w * 0.34, h * 0.07, 10);
        rr(ctx, w * 0.08, h * 0.75, w * 0.24, h * 0.07, 10);
      });
      const face = new THREE.Mesh(
        shapeGeo(roundedRect(1.62, 0.97, 0.08)),
        new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, toneMapped: false }),
      );
      face.position.z = 0.037;
      g.add(face);
      g.rotation.set(-0.2, 0.25, 0.1);
      return g;
    },
  },
};

// ---------- renderer ----------
let renderer;
let envTex;
let font;
const img = {};

const loadImage = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export async function setup(assets, fontUrl) {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  for (const [k, v] of Object.entries(assets)) img[k] = await loadImage(v);
  font = await new FontLoader().loadAsync(fontUrl);
}

// Sample every mesh's vertices in world space so the frame hugs the objects
// rather than their axis-aligned box; four points below leave room for the
// contact shadow.
function samplePoints(group, shadow) {
  const pts = [];
  const v = new THREE.Vector3();
  group.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    const step = Math.max(1, Math.floor(pos.count / 600));
    for (let i = 0; i < pos.count; i += step) {
      pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).clone());
    }
  });
  if (shadow) {
    const box = new THREE.Box3().setFromPoints(pts);
    for (const x of [box.min.x, box.max.x]) {
      for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, box.min.y - 0.12, z));
    }
  }
  return pts;
}

function fit(camera, pts, aspect, pad) {
  const box = new THREE.Box3().setFromPoints(pts);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  // A point at depth d (towards the camera) with lateral offset x is inside
  // the frustum when the camera is at least d + x / tan(fov/2) away.
  const dir = camera.position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, dir).normalize();
  const trueUp = new THREE.Vector3().crossVectors(dir, right).normalize();
  let need = 0;
  for (const q of pts) {
    const p = q.clone().sub(center);
    const depth = p.dot(dir);
    const dx = Math.abs(p.dot(right));
    const dy = Math.abs(p.dot(trueUp));
    need = Math.max(need, depth + dx / Math.tan(hFov / 2), depth + dy / Math.tan(vFov / 2));
  }
  camera.position.copy(center).addScaledVector(dir, need * pad);
  camera.lookAt(center);
  camera.near = need * 0.1;
  camera.far = need * 4;
  camera.updateProjectionMatrix();
  return { center, size, dist: need };
}

export async function render(name) {
  const def = SCENES[name];
  const { w, h } = def;
  renderer.setSize(w, h, false);
  const scene = new THREE.Scene();
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;
  const group = def.build({ img, font });
  scene.add(group);
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const camera = new THREE.PerspectiveCamera(26, w / h, 0.1, 100);
  camera.position.set(...def.dir);
  const pts = samplePoints(group, def.shadow !== false);
  const { center, size, dist } = fit(camera, pts, w / h, def.pad ?? 1.04);

  const key = new THREE.DirectionalLight('#ffffff', 1.9);
  key.position.copy(center).add(new THREE.Vector3(-2.5, 5, 3.5));
  key.target.position.copy(center);
  key.castShadow = def.shadow !== false;
  key.shadow.mapSize.set(2048, 2048);
  const ext = Math.max(size.x, size.y, size.z) * 1.4;
  Object.assign(key.shadow.camera, {
    left: -ext,
    right: ext,
    top: ext,
    bottom: -ext,
    near: 0.1,
    far: dist * 4,
  });
  key.shadow.radius = 8;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#dcd4ff', 0.55);
  fill.position.copy(center).add(new THREE.Vector3(4, 1.5, 2));
  scene.add(fill);

  if (def.shadow !== false) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ color: '#2A1D5E', opacity: 0.18 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = box.min.y - 0.005;
    ground.receiveShadow = true;
    scene.add(ground);
  }
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}
