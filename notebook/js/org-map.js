/* SZL Org Map — interactive 3D chord/node diagram of the five organs.
   5 organ nodes connected by live Wire D/E/F/G traces; receipt-count pulses
   poll each flagship /healthz every 5s (real-time mesh heartbeat).
   Self-hosted Three.js, touch-rotate, mobile-first, prefers-reduced-motion aware.
   Apache-2.0 · Signed Yachay <yachay@szlholdings.dev> · Doctrine v11 LOCKED 749/14/163. */
import * as THREE from '../assets/three.module.min.js';

const cv = document.getElementById('orgmap3d');
if (cv) {
  const SZL_MOBILE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const SZL_REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PR = Math.min(devicePixelRatio || 1, SZL_MOBILE ? 1.5 : 2);

  const ORGANS = [
    { id:'amaru',     label:'amaru',     color:0xe4cf99 },
    { id:'sentra',    label:'sentra',    color:0x5cc4bf },
    { id:'rosie',     label:'rosie',     color:0xff9a7a },
    { id:'killinchu', label:'killinchu', color:0x8fb6ff },
    { id:'a11oy',     label:'a11oy',     color:0xd4a444 },
  ];

  const renderer = new THREE.WebGLRenderer({ canvas:cv, antialias:!SZL_MOBILE, alpha:true,
    powerPreference: SZL_MOBILE ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(PR);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(46, 16/9, 0.1, 100);
  cam.position.set(0, 0.3, 6.4);
  scene.add(new THREE.AmbientLight(0x556070, 1.0));
  const key = new THREE.DirectionalLight(0xe8cc6a, 1.4); key.position.set(3,4,5); scene.add(key);
  const rim = new THREE.PointLight(0x5cc4bf, 0.9, 30); rim.position.set(-4,-2,4); scene.add(rim);

  const root = new THREE.Group(); scene.add(root);

  // place 5 nodes on a ring (chord layout)
  const R = 2.4, nodes = [];
  ORGANS.forEach((o,i)=>{
    const a = (i/ORGANS.length)*Math.PI*2 - Math.PI/2;
    const pos = new THREE.Vector3(Math.cos(a)*R, Math.sin(a)*R*0.62, 0);
    const mat = new THREE.MeshStandardMaterial({ color:o.color, emissive:o.color, emissiveIntensity:0.55, metalness:0.6, roughness:0.3 });
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34,1), mat);
    m.position.copy(pos); m.userData={ organ:o, base:0.55, pulse:0 };
    root.add(m); nodes.push(m);
  });

  // chord edges between every pair (the mesh wiring) + labelled Wire D/E/F/G on the ring
  const edgeMat = new THREE.LineBasicMaterial({ color:0xd4a444, transparent:true, opacity:0.32 });
  const segs=[];
  for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){ segs.push(nodes[i].position, nodes[j].position); }
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs), edgeMat));

  // Wire D/E/F/G traveling pulses along the outer ring (adjacent edges)
  const wireNames=['D','E','F','G','C'];
  const pulses = nodes.map((n,i)=>{
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.09,10,10),
      new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xffffff, emissiveIntensity:1.6 }));
    root.add(m); return { mesh:m, from:i, to:(i+1)%nodes.length, t:Math.random(), wire:wireNames[i] };
  });

  // touch / mouse rotate
  let drag=false, px=0, py=0;
  const dn=e=>{drag=true;const p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;};
  const mv=e=>{if(!drag)return;const p=e.touches?e.touches[0]:e;
    root.rotation.y+=(p.clientX-px)*0.01; root.rotation.x+=(p.clientY-py)*0.01;
    px=p.clientX;py=p.clientY; if(e.touches)e.preventDefault();};
  const up=()=>drag=false;
  cv.addEventListener('mousedown',dn); cv.addEventListener('mousemove',mv); addEventListener('mouseup',up);
  cv.addEventListener('touchstart',dn,{passive:true}); cv.addEventListener('touchmove',mv,{passive:false}); cv.addEventListener('touchend',up);

  // click a node -> open its Space
  cv.addEventListener('click',e=>{
    if(drag) return;
    const rect=cv.getBoundingClientRect();
    const m=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1);
    const rc=new THREE.Raycaster(); rc.setFromCamera(m,cam);
    const hit=rc.intersectObjects(nodes)[0];
    if(hit) window.open('https://huggingface.co/spaces/SZLHOLDINGS/'+hit.object.userData.organ.id,'_blank','noopener');
  });

  // live /healthz polling -> pulse the node + update legend
  function poll(){
    ORGANS.forEach((o,i)=>{
      fetch('https://szlholdings-'+o.id+'.hf.space/healthz',{mode:'cors',cache:'no-store'})
        .then(r=>{ nodes[i].userData.pulse = r.ok ? 1.0 : 0.0;
          const el=document.querySelector('.orgmap-leg[data-organ="'+o.id+'"] .ohb');
          if(el){ el.textContent=r.status; el.className='ohb '+(r.ok?'ok':'down'); } })
        .catch(()=>{ const el=document.querySelector('.orgmap-leg[data-organ="'+o.id+'"] .ohb'); if(el){el.textContent='—';el.className='ohb down';} });
    });
  }
  poll(); setInterval(poll,5000);

  function size(){ const w=cv.clientWidth, h=cv.clientHeight||320; renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }
  addEventListener('resize',size); size();

  let t0=performance.now();
  function loop(now){
    requestAnimationFrame(loop);
    if(document.hidden) return;
    const t=(now-t0)/1000;
    if(!SZL_REDUCED) root.rotation.y += 0.0035;
    nodes.forEach(n=>{ const p=n.userData.pulse; n.userData.pulse*=0.96;
      const s = n.userData.base*(1 + 0.18*Math.sin(t*2) + 0.5*p); n.scale.setScalar(s);
      n.material.emissiveIntensity = 0.5 + 0.6*p; });
    pulses.forEach(p=>{ p.t+=0.012; if(p.t>1)p.t=0;
      p.mesh.position.lerpVectors(nodes[p.from].position, nodes[p.to].position, p.t); });
    renderer.render(scene,cam);
  }
  requestAnimationFrame(loop);
}
