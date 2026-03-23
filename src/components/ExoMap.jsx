import { useState, useEffect, useRef } from 'react';

const HUE_HEX = {
  teal:   '#1D9E75',
  blue:   '#378ADD',
  amber:  '#EF9F27',
  red:    '#E24B4A',
  purple: '#7F77DD',
};

const HUE_RGB = {
  teal:   [29,  158, 117],
  blue:   [55,  138, 221],
  amber:  [239, 159,  39],
  red:    [226,  75,  74],
  purple: [127, 119, 221],
};

// Deterministic pseudo-random from string seed
function seededRng(seed) {
  let s = (seed | 0) || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

function idSeed(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return h;
}

// Convert RA (degrees), Dec (degrees), dist (light-years) → (x, y, z)
// Standard astronomical convention: x toward RA=0/Dec=0, z toward north pole
function raDecDistToXYZ(ra, dec, dist) {
  const raRad  = ra  * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  return [
     dist * Math.cos(decRad) * Math.cos(raRad),
     dist * Math.sin(decRad),
     dist * Math.cos(decRad) * Math.sin(raRad),
  ];
}

const SCALE = 0.06; // ly → scene units

// Estimate distance (ly) from discovery facility/method when sy_dist is unavailable
function estimateDist(scope, rng) {
  const s = (scope || '').toLowerCase();
  // Microlensing surveys — deep galactic bulge
  if (s.includes('microlens') || s.includes('ogle') || s.includes('moa') || s === 'microlensing')
    return 10000 + rng() * 15000;
  // Kepler primary mission — fixed deep field in Cygnus
  if ((s.includes('kepler') && !s.includes('k2')) || s === 'transit' && rng() > 0.5)
    return 1000 + rng() * 1500;
  // K2 — shorter pointings, slightly closer average
  if (s.includes('k2'))
    return 500 + rng() * 1500;
  // CoRoT — similar depth to Kepler
  if (s.includes('corot'))
    return 1000 + rng() * 2000;
  // TESS — nearby bright stars
  if (s.includes('tess'))
    return 50 + rng() * 450;
  // Direct imaging — nearby young systems
  if (s.includes('imag') || s.includes('direct'))
    return 50 + rng() * 500;
  // Radial velocity instruments — all nearby
  if (s.includes('radial') || s.includes('harps') || s.includes('hires') ||
      s.includes('keck') || s.includes('espresso') || s.includes('coralie') ||
      s.includes('sophie') || s === 'radial velocity')
    return 15 + rng() * 285;
  // Astrometry — very nearby
  if (s.includes('astro'))
    return 5 + rng() * 50;
  // Generic transit / unknown
  return 300 + rng() * 1700;
}

// Real coordinates when available; real direction + estimated distance otherwise
function planetXYZ(planet) {
  const rng = seededRng(idSeed(planet.id));
  const hasRealDist = planet.dist < 9000;
  const dist = hasRealDist ? planet.dist : estimateDist(planet.scope, rng);

  if (planet.ra != null && planet.dec != null) {
    const [x, y, z] = raDecDistToXYZ(planet.ra, planet.dec, dist);
    return [x * SCALE, y * SCALE, z * SCALE];
  }

  // No RA/Dec at all (rare) — pure random shell
  const theta = rng() * Math.PI * 2;
  const cosP  = 2 * rng() - 1;
  const sinP  = Math.sqrt(1 - cosP * cosP);
  const r     = dist * SCALE;
  return [r * sinP * Math.cos(theta), r * cosP * 0.3, r * sinP * Math.sin(theta)];
}

export default function ExoMap({ planets, onViewDetail }) {
  const mountRef   = useRef(null);
  const [threeReady, setThreeReady] = useState(!!window.__THREE__);
  const [info, setInfo]   = useState(null); // { planet, x, y }

  // ── Load Three.js once (reuse if already loaded) ─────────────────────────
  useEffect(() => {
    if (window.__THREE__) { setThreeReady(true); return; }
    const existing = document.querySelector("script[data-three]");
    if (existing) {
      const poll = setInterval(() => {
        if (window.__THREE__) { setThreeReady(true); clearInterval(poll); }
      }, 100);
      return () => clearInterval(poll);
    }
    const s = document.createElement("script");
    s.setAttribute("data-three", "1");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.crossOrigin = "anonymous";
    s.onload = () => { window.__THREE__ = window.THREE; setThreeReady(true); };
    s.onerror = () => console.error("ExoMap: failed to load Three.js");
    document.head.appendChild(s);
  }, []);

  // ── Build Three.js scene ─────────────────────────────────────────────────
  useEffect(() => {
    if (!threeReady || !mountRef.current || planets.length < 2) return;
    const THREE = window.__THREE__;
    const el = mountRef.current;

    let W = el.clientWidth;
    let H = el.clientHeight || 620;

    // ─ Renderer ─
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ─ Scene & Camera ─
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 5000);

    // Camera orbit state (spherical)
    let camTheta  = 0.5;
    let camPhi    = 1.25;
    let camRadius = 150;

    const updateCam = () => {
      camera.position.set(
        camRadius * Math.sin(camPhi) * Math.cos(camTheta),
        camRadius * Math.cos(camPhi),
        camRadius * Math.sin(camPhi) * Math.sin(camTheta),
      );
      camera.lookAt(0, 0, 0);
    };
    updateCam();

    // ─ Planet point cloud ─
    const posArr   = [];
    const colorArr = [];
    const sizeArr  = [];
    const validPlanets = [];

    for (const p of planets) {
      const xyz = planetXYZ(p);
      posArr.push(xyz[0], xyz[1], xyz[2]);

      const rgb  = HUE_RGB[p.hue] || HUE_RGB.blue;
      const norm = Math.min(1, Math.max(0, ((p.r || 1500) - 1200) / 900));
      const brightness = 0.35 + norm * 0.65;
      colorArr.push(rgb[0] / 255 * brightness, rgb[1] / 255 * brightness, rgb[2] / 255 * brightness);

      sizeArr.push(1.8 + norm * 5.2);
      validPlanets.push(p);
    }

    const planetGeo = new THREE.BufferGeometry();
    planetGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    planetGeo.setAttribute('aColor',   new THREE.Float32BufferAttribute(colorArr, 3));
    planetGeo.setAttribute('aSize',    new THREE.Float32BufferAttribute(sizeArr, 1));

    const planetMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        attribute vec3  aColor;
        varying   vec3  vColor;
        void main() {
          vColor = aColor;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (260.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float core  = 1.0 - smoothstep(0.0, 0.18, d);
          float glow  = 1.0 - smoothstep(0.18, 0.5, d);
          float alpha = core * 0.95 + glow * 0.45;
          gl_FragColor = vec4(vColor + core * 0.4, alpha);
        }
      `,
      blending:    THREE.AdditiveBlending,
      depthTest:   false,
      transparent: true,
    });

    const planetPoints = new THREE.Points(planetGeo, planetMat);
    scene.add(planetPoints);

    // ─ Background star field ─
    const bgPos = [];
    const bgRng = seededRng(97531);
    for (let i = 0; i < 3000; i++) {
      const t = bgRng() * Math.PI * 2;
      const c = 2 * bgRng() - 1;
      const s = Math.sqrt(1 - c * c);
      const r = 500 + bgRng() * 700;
      bgPos.push(r * s * Math.cos(t), r * c, r * s * Math.sin(t));
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0x3a4d60, size: 0.45, sizeAttenuation: true });
    scene.add(new THREE.Points(bgGeo, bgMat));

    // ─ Galactic plane grid (subtle) ─
    const gridHelper = new THREE.GridHelper(300, 30, 0x0d2a22, 0x0a1e18);
    gridHelper.material.opacity = 0.18;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);


    // ─ Raycaster ─
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 4 };
    const mouse = new THREE.Vector2();

    // ─ Mouse state ─
    let dragging = false;
    let lastX = 0, lastY = 0;
    let hoveredIdx = -1;
    let clickTarget = null;

    const onMouseDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMouseUp = () => { dragging = false; };

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (dragging) {
        camTheta -= (e.clientX - lastX) * 0.005;
        camPhi = Math.max(0.12, Math.min(Math.PI - 0.12, camPhi - (e.clientY - lastY) * 0.005));
        updateCam();
        lastX = e.clientX;
        lastY = e.clientY;
        setInfo(null);
        return;
      }

      // Raycasting
      mouse.x =  (mx / rect.width)  * 2 - 1;
      mouse.y = -(my / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(planetPoints);

      if (hits.length > 0) {
        const idx = hits[0].index;
        hoveredIdx  = idx;
        clickTarget = validPlanets[idx];
        setInfo({ planet: validPlanets[idx], x: mx, y: my });
      } else {
        hoveredIdx  = -1;
        clickTarget = null;
        setInfo(null);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      camRadius = Math.max(25, Math.min(450, camRadius + e.deltaY * 0.22));
      updateCam();
    };

    const onClick = () => {
      if (clickTarget) onViewDetail(clickTarget);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('click', onClick);

    // ─ Resize handler ─
    const onResize = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ─ Animate ─
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!dragging) {
        camTheta += 0.00035;
        updateCam();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      planetGeo.dispose(); planetMat.dispose();
      bgGeo.dispose(); bgMat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [threeReady, planets]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: '#e8f4ff', letterSpacing: '0.15em', marginBottom: 4 }}>3D EXOPLANET MAP</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>
            {planets.length} PLANETS · DRAG TO ORBIT · SCROLL TO ZOOM · CLICK FOR DETAILS
          </div>
        </div>
        {/* Color legend */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['teal','Habitable zone'],['blue','Sub-Neptune'],['amber','Hot world'],['red','Lava/extreme'],['purple','Gas/ice giant']].map(([hue, label]) => (
            <div key={hue} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: HUE_HEX[hue], boxShadow: `0 0 8px ${HUE_HEX[hue]}` }}/>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas wrapper — position:relative so tooltip is anchored here */}
      <div style={{ position: 'relative' }}>
        <div
          ref={mountRef}
          style={{
            width: '100%', height: 620,
            borderRadius: 14,
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at 50% 40%, #020e1a 0%, #010408 100%)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            cursor: 'grab',
          }}
        />

        {/* Loading overlay */}
        {!threeReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>LOADING 3D ENGINE…</div>
          </div>
        )}

        {/* Hover tooltip */}
        {info && (
          <div style={{
            position: 'absolute',
            left: Math.min(info.x + 16, 730),
            top:  Math.max(info.y - 70, 8),
            background: 'rgba(4,11,20,0.96)',
            border: `0.5px solid ${HUE_HEX[info.planet.hue] || '#378ADD'}55`,
            borderRadius: 10,
            padding: '10px 14px',
            pointerEvents: 'none',
            zIndex: 20,
            minWidth: 190,
            boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${HUE_HEX[info.planet.hue] || '#378ADD'}18`,
          }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: '#e8f4ff', marginBottom: 3 }}>
              {info.planet.name}
            </div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 8 }}>
              {info.planet.type} · {info.planet.host}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginBottom: 2 }}>RATING</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 'bold', color: HUE_HEX[info.planet.hue] || '#378ADD' }}>
                  {info.planet.r || 1500}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginBottom: 2 }}>DISTANCE</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                  {info.planet.dist < 9000 ? (info.planet.dist < 1000 ? `${info.planet.dist} ly` : `${(info.planet.dist/1000).toFixed(1)}k ly`) : '?'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginBottom: 2 }}>TEMP</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                  {info.planet.temp} K
                </div>
              </div>
            </div>
            <div style={{ marginTop: 7, fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>
              click to view details →
            </div>
          </div>
        )}

        {/* Bottom-left label */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: "'Space Mono',monospace", fontSize: 7, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', pointerEvents: 'none' }}>
          SIZE &amp; BRIGHTNESS = COMMUNITY RATING
        </div>

        {/* Rating scale legend */}
        <div style={{ position: 'absolute', bottom: 14, right: 16, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
          {[['dim',8,'LOW'],['med',14,'MED'],['bright',20,'HIGH']].map(([k,sz,label]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: sz/3, height: sz/3, borderRadius: '50%', background: '#378ADD', boxShadow: `0 0 ${sz/2}px #378ADD` }}/>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 6, color: 'rgba(255,255,255,0.2)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div style={{ marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.08em', lineHeight: 1.6 }}>
        Directions are real (RA/Dec). Distances: ~60% measured, ~40% estimated from discovery survey depth (Kepler/TESS/RV etc.).
      </div>
    </div>
  );
}
