import { useState, useEffect, useRef } from 'react';
import { HC } from '../constants/colors';

export default function Planet3D({ planet, size = 180 }) {
  const mountRef  = useRef(null);
  const frameRef  = useRef(null);

  // Load Three.js once - sets threeReady so scene effect re-runs
  const [threeReady, setThreeReady] = useState(!!window.__THREE__);
  useEffect(() => {
    if (window.__THREE__) { setThreeReady(true); return; }
    if (document.querySelector("script[data-three]")) return; // already loading
    const s = document.createElement("script");
    s.setAttribute("data-three","1");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.crossOrigin = "anonymous";
    s.onload = () => { window.__THREE__ = window.THREE; setThreeReady(true); };
    s.onerror = () => { console.error("Failed to load Three.js from CDN"); };
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || !threeReady) return;

    // ── derive visual properties from planet data ──────────────────────────
    const type  = planet.type || "";
    const temp  = planet.temp || 300;
    const radius = planet.radius || 1;
    const hue   = planet.hue || "blue";

    // Base color palette from planet hue
    const palettes = {
      teal:   { land:"#1a6b55", ocean:"#0d3d52", atm:"#4db8a0", cloud:"#cdf0e8" },
      blue:   { land:"#1a3d6b", ocean:"#0d2040", atm:"#4d8ab8", cloud:"#c8dff0" },
      amber:  { land:"#8b4a12", ocean:"#3d1f00", atm:"#c88040", cloud:"#f0d4a0" },
      red:    { land:"#8b1a1a", ocean:"#400808", atm:"#c84040", cloud:"#f0c0c0" },
      purple: { land:"#4a2080", ocean:"#1a0840", atm:"#8060c0", cloud:"#d0c0f0" },
    };
    const pal = palettes[hue] || palettes.blue;

    // Paint procedural texture on a 512×256 canvas
    const texCanvas = document.createElement("canvas");
    texCanvas.width  = 512;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");

    const isGas    = type.includes("Jupiter") || type.includes("Saturn") || type.includes("Gas") || type.includes("Giant") || type.includes("Neptune") || type.includes("Hot");
    const isLava   = type.includes("Lava") || temp > 1500;
    const isIcy    = temp < 180 && !isGas;
    const isPulsar = type.includes("Pulsar");
    const isHycean = type.includes("Hycean");

    if (isPulsar) {
      // Pure black with electric grid lines
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = "#6040ff";
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.4;
      for (let x = 0; x < 512; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,256); ctx.stroke(); }
      for (let y = 0; y < 256; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else if (isLava) {
      // Magma ocean with glowing cracks
      const bg = ctx.createLinearGradient(0,0,0,256);
      bg.addColorStop(0, "#300808"); bg.addColorStop(1, "#100202");
      ctx.fillStyle = bg; ctx.fillRect(0,0,512,256);
      // Lava cracks
      ctx.strokeStyle = temp > 3000 ? "#ffee00" : "#ff6600";
      ctx.lineWidth = 1.5;
      const rng = (s) => { let x=Math.sin(s*127.1+0.3)*43758.5; return x-Math.floor(x); };
      for (let i=0; i<80; i++) {
        ctx.globalAlpha = 0.3 + rng(i)*0.5;
        ctx.beginPath();
        let px=rng(i*3)*512, py=rng(i*7)*256;
        ctx.moveTo(px,py);
        for (let j=0;j<6;j++) { px+=rng(i*11+j)*60-30; py+=rng(i*13+j)*40-20; ctx.lineTo(px,py); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (isGas) {
      // Horizontal bands - hot Jupiters brighter, cold Jupiters darker
      const brightness = Math.min(1, temp / 1200);
      for (let y=0; y<256; y++) {
        const t = y/256;
        const band = Math.sin(t*Math.PI*14 + 0.5) * 0.5 + 0.5;
        const r = Math.round(parseInt(pal.land.slice(1,3),16) * (0.6+band*0.8) * (0.5+brightness*0.5));
        const g = Math.round(parseInt(pal.land.slice(3,5),16) * (0.6+band*0.8) * (0.5+brightness*0.5));
        const b = Math.round(parseInt(pal.land.slice(5,7),16) * (0.6+band*0.8) * (0.5+brightness*0.5));
        ctx.fillStyle = `rgb(${Math.min(255,r)},${Math.min(255,g)},${Math.min(255,b)})`;
        ctx.fillRect(0, y, 512, 1);
      }
      // Storm spots
      for (let i=0; i<3; i++) {
        const sx = 80+i*160, sy = 80+i*40;
        const grad = ctx.createRadialGradient(sx,sy,0,sx,sy,25);
        grad.addColorStop(0, pal.cloud+"cc"); grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad; ctx.fillRect(sx-30,sy-30,60,60);
      }
    } else if (isHycean) {
      // Deep ocean world - water shimmer
      const bg = ctx.createLinearGradient(0,0,0,256);
      bg.addColorStop(0,"#062838"); bg.addColorStop(1,"#020d14");
      ctx.fillStyle = bg; ctx.fillRect(0,0,512,256);
      ctx.strokeStyle = "#1a8ab8"; ctx.lineWidth = 0.8;
      for (let i=0; i<60; i++) {
        ctx.globalAlpha = 0.1+Math.sin(i*0.7)*0.1;
        ctx.beginPath();
        ctx.moveTo(0, i*4.5);
        for (let x=0;x<512;x+=8) ctx.lineTo(x, i*4.5+Math.sin(x*0.05+i)*3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (isIcy) {
      // Ice/frozen world - pale blue-white with cracks
      ctx.fillStyle = "#c8dde8"; ctx.fillRect(0,0,512,256);
      ctx.fillStyle = "#98b8cc";
      for (let i=0; i<200; i++) {
        const x=Math.random()*512, y=Math.random()*256;
        ctx.fillRect(x,y,Math.random()*40+5,Math.random()*3+1);
      }
      ctx.strokeStyle = "#7090a8"; ctx.lineWidth=0.5;
      for (let i=0;i<30;i++) {
        ctx.beginPath(); ctx.moveTo(Math.random()*512,Math.random()*256);
        ctx.lineTo(Math.random()*512,Math.random()*256); ctx.stroke();
      }
    } else {
      // Rocky / Earth-like - continents and ocean
      ctx.fillStyle = pal.ocean; ctx.fillRect(0,0,512,256);
      // Continents as irregular blobs
      ctx.fillStyle = pal.land;
      const blobs = [[60,80,90,60],[180,120,120,50],[300,60,80,70],[400,150,100,55],[150,180,70,40],[350,100,60,45]];
      blobs.forEach(([x,y,w,h]) => {
        ctx.beginPath(); ctx.ellipse(x,y,w,h,Math.random()*Math.PI,0,Math.PI*2); ctx.fill();
      });
      // Ice caps
      const capColor = isIcy ? "#ffffff" : "#e8f4ff";
      ctx.fillStyle = capColor; ctx.globalAlpha=0.7;
      ctx.fillRect(0,0,512,20); ctx.fillRect(0,236,512,20);
      ctx.globalAlpha=1;
      // Cloud layer overlay
      ctx.fillStyle = pal.cloud; ctx.globalAlpha=0.25;
      for (let i=0;i<12;i++) {
        const cx2=Math.random()*512, cy2=Math.random()*256;
        ctx.beginPath(); ctx.ellipse(cx2,cy2,60+Math.random()*80,15+Math.random()*20,Math.random(),0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    // ── Three.js scene ─────────────────────────────────────────────────────
    const THREE = window.__THREE__;

    const W = size, H = size;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, W/H, 0.1, 100);
    camera.position.z = 3.2;

    // Texture from canvas
    const texture = new THREE.CanvasTexture(texCanvas);

    // Planet sphere
    const geo  = new THREE.SphereGeometry(1, 64, 64);
    const mat  = new THREE.MeshPhongMaterial({
      map: texture,
      specular: isGas ? new THREE.Color(0.3, 0.3, 0.3) : new THREE.Color(0.05, 0.05, 0.05),
      shininess: isGas ? 30 : 8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Atmosphere glow (additive sphere slightly larger)
    const atmColor = pal.atm;
    const atmMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(atmColor),
      transparent: true,
      opacity: isLava ? 0.08 : isPulsar ? 0.15 : 0.12,
      side: THREE.BackSide,
    });
    const atm = new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 32), atmMat);
    scene.add(atm);

    // Rings for gas giants / Saturn-type
    const hasRings = type.includes("Saturn") || type.includes("Gas Giant");
    if (hasRings) {
      const ringGeo = new THREE.RingGeometry(1.3, 2.0, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pal.land),
        transparent: true, opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.42;
      scene.add(ring);
    }

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xfff8e8, 1.4);
    sunLight.position.set(4, 2, 3);
    scene.add(sunLight);
    const ambient = new THREE.AmbientLight(0x112244, 0.6);
    scene.add(ambient);
    // Subtle rim light from opposite side
    const rimLight = new THREE.DirectionalLight(new THREE.Color(pal.atm), 0.3);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    // Animate - slow rotation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      mesh.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      texture.dispose();
      geo.dispose();
      mat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [planet.id, threeReady]);

  const c = HC[planet.hue] || HC.blue;
  return (
    <div ref={mountRef} style={{
      width:size, height:size, flexShrink:0,
      borderRadius:"50%", overflow:"hidden",
      background: threeReady ? "transparent" : `radial-gradient(circle at 35% 35%, ${c.accent}99, ${c.bg})`,
      boxShadow:`0 0 40px ${c.accent}44`,
    }}/>
  );
}
