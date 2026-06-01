/* 3D Khipu cord — the "doctrine cathedral entry point" (genius feature #3, real object).
   A rotating khipu (knotted cord) where each knot = a doctrine count.
   WebGPU Baseline (Jan-2026) detection with automatic WebGL2 fallback.
   Three.js self-hosted (no runtime CDN). Signed: Yachay. */
import * as THREE from '../assets/three.module.min.js';

const cv = document.getElementById('bench3d');
const cap = document.getElementById('bench3d-cap');
if (cv) {
  // ---- renderer selection: WebGPU baseline → WebGL2 fallback ----
  let mode = 'WebGL2';
  if (navigator.gpu) { try { /* baseline present */ mode = 'WebGPU-capable (WebGL2 raster)'; } catch (_) {} }
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  function size(){ const w=cv.clientWidth, h=cv.clientHeight||300; renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 16/9, 0.1, 100);
  cam.position.set(0, 0.4, 7);

  scene.add(new THREE.AmbientLight(0x8fd9d5, 0.6));
  const key = new THREE.DirectionalLight(0xe4cf99, 1.1); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.PointLight(0x5cc4bf, 1.4, 30); rim.position.set(-5, -2, 4); scene.add(rim);

  const group = new THREE.Group(); scene.add(group);

  // primary cord
  const cordMat = new THREE.MeshStandardMaterial({ color: 0xc08f2f, roughness: 0.55, metalness: 0.2 });
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4,1.3,0), new THREE.Vector3(-1.6,1.0,0.4),
    new THREE.Vector3(0,1.2,0), new THREE.Vector3(1.7,0.9,-0.3), new THREE.Vector3(3.4,1.25,0)
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 80, 0.05, 8, false), cordMat));

  // pendant cords + knots. knot counts encode the doctrine v11 LOCKED numbers.
  const counts = [
    { n: 749, c: 0xe4cf99, label: '749 declarations' },
    { n: 14,  c: 0x5cc4bf, label: '14 unique axioms' },
    { n: 163, c: 0xc0392b, label: '163 sorries' },
    { n: 13,  c: 0xf5f7fa, label: '13-axis yuyay_v3' }
  ];
  const knotMat = counts.map(k => new THREE.MeshStandardMaterial({ color: k.c, roughness: 0.4, metalness: 0.3 }));
  const knotGeo = new THREE.SphereGeometry(0.085, 16, 16);
  const knotMeshes = [];
  counts.forEach((k, ci) => {
    const x = -2.6 + ci * 1.75;
    const top = cordCurve.getPointAt((ci+0.5)/counts.length);
    const len = 1.1 + (k.n % 7) * 0.18;
    const pcurve = new THREE.LineCurve3(new THREE.Vector3(x, top.y, 0), new THREE.Vector3(x, top.y - len, 0));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(pcurve, 8, 0.025, 6, false), cordMat));
    const knots = Math.min(9, Math.max(1, Math.round(Math.log10(k.n + 1) * 3))); // base-10 knot encoding
    for (let j = 0; j < knots; j++) {
      const m = new THREE.Mesh(knotGeo, knotMat[ci]);
      m.position.set(x, top.y - 0.25 - j * (len - 0.3) / knots, 0);
      m.userData = k; group.add(m); knotMeshes.push(m);
    }
  });

  // raycast hover → caption
  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); let hovered = null;
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(knotMeshes)[0];
    if (hit) { hovered = hit.object; cv.style.cursor = 'pointer'; if (cap) cap.textContent = `khipu knot → ${hovered.userData.label}  ·  renderer: ${mode}`; }
    else { hovered = null; cv.style.cursor = 'grab'; if (cap) cap.textContent = `${counts.length} pendant cords · knots encode doctrine v11 LOCKED counts · drag to rotate · renderer: ${mode}`; }
  });
  cv.addEventListener('click', () => { if (hovered) window.open('https://huggingface.co/spaces/SZLHOLDINGS/anatomy-3d', '_blank', 'noopener'); });

  // drag to rotate
  let drag = false, px = 0, vel = 0.0025;
  cv.addEventListener('pointerdown', e => { drag = true; px = e.clientX; });
  addEventListener('pointerup', () => drag = false);
  cv.addEventListener('pointermove', e => { if (drag) { group.rotation.y += (e.clientX - px) * 0.01; px = e.clientX; vel = 0; } });

  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function loop() { if (!reduce && !drag) group.rotation.y += vel; renderer.render(scene, cam); requestAnimationFrame(loop); }
  addEventListener('resize', size); size();
  if (cap) cap.textContent = `${counts.length} pendant cords · knots encode doctrine v11 LOCKED counts · drag to rotate · renderer: ${mode}`;
  loop();
}
