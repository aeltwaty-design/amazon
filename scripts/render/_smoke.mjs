import { chromium } from 'playwright';
const html = `<!doctype html><body style="margin:0;background:transparent">
<canvas id=c width=400 height=300></canvas>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const r = new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true,alpha:true,preserveDrawingBuffer:true});
r.setPixelRatio(2); r.setSize(400,300,false); r.toneMapping=THREE.ACESFilmicToneMapping; r.shadowMap.enabled=true; r.shadowMap.type=THREE.PCFSoftShadowMap;
const s = new THREE.Scene(); s.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(),0.04).texture;
const cam = new THREE.PerspectiveCamera(30,4/3,0.1,100); cam.position.set(3,2.6,5); cam.lookAt(0,0,0);
const m = new THREE.Mesh(new RoundedBoxGeometry(1.6,1.6,1.6,6,0.25), new THREE.MeshPhysicalMaterial({color:'#755BD8',roughness:0.35,metalness:0}));
m.castShadow=true; m.rotation.y=0.6; s.add(m);
const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.14,48), new THREE.MeshPhysicalMaterial({color:'#FAC333',roughness:0.25,metalness:0.6}));
coin.position.set(1.4,-0.5,0.8); coin.rotation.x=0.4; coin.castShadow=true; s.add(coin);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.ShadowMaterial({opacity:0.18})); ground.rotation.x=-Math.PI/2; ground.position.y=-0.8; ground.receiveShadow=true; s.add(ground);
const l = new THREE.DirectionalLight('#fff',2.2); l.position.set(3,6,4); l.castShadow=true; l.shadow.mapSize.set(2048,2048); l.shadow.radius=6; s.add(l);
r.render(s,cam); window.__done = r.getContext().getParameter(r.getContext().RENDERER);
</script></body>`;
const b = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const p = await b.newPage({ deviceScaleFactor: 1 });
p.on('console', (m) => console.log('console:', m.text()));
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.setContent(html, { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__done, null, { timeout: 60000 });
console.log('renderer:', await p.evaluate(() => window.__done));
const dataUrl = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
const fs = await import('fs');
fs.writeFileSync(process.argv[2], Buffer.from(dataUrl.split(',')[1], 'base64'));
await b.close();
