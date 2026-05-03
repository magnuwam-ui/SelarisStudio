// Background layers: Starfield, Saturn rig, Spaceships, Custom Cursor

const { useEffect, useRef, useState } = React;

// ──────────────────────────────────────────────────────────────────
// Starfield + shooting stars
// ──────────────────────────────────────────────────────────────────
function Starfield({ intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w, h, dpr;
    let stars = [];
    let shooters = [];
    let mouseX = 0, mouseY = 0;
    let lastShootAt = 0;
    let nextShootIn = 2500 + Math.random() * 4000;
    let raf;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      initStars();
    }

    function initStars() {
      stars = [];
      const baseCount = Math.min(360, Math.floor((window.innerWidth * window.innerHeight) / 4000));
      const count = Math.floor(baseCount * intensity);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 0.9 + 0.1,
          r: Math.random() * 1.4 + 0.2,
          tw: Math.random() * Math.PI * 2,
          twS: Math.random() * 0.02 + 0.005,
          hue: Math.random() < 0.08 ? (Math.random() < 0.5 ? '#ff007f' : '#fbcfe8') : '#ffffff'
        });
      }
    }

    function spawnShooter() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const startX = dir === 1 ? Math.random() * w * 0.4 : w * 0.6 + Math.random() * w * 0.4;
      const startY = Math.random() * h * 0.4;
      const angle = (dir === 1 ? 1 : -1) * (Math.PI / 7) + Math.PI / 4;
      const speed = (10 + Math.random() * 8) * dpr;
      shooters.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed * dir,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 90 + Math.random() * 40,
        length: 80 + Math.random() * 90,
        hue: Math.random() < 0.25 ? '#FF8000' : (Math.random() < 0.4 ? '#FF0080' : '#ffffff'),
      });
    }

    function draw(now) {
      if (!reduce && now - lastShootAt > nextShootIn) {
        spawnShooter();
        lastShootAt = now;
        nextShootIn = 2500 + Math.random() * 5000;
      }

      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.tw += s.twS;
        const a = 0.4 + Math.sin(s.tw) * 0.4;
        const px = s.x + mouseX * 14 * s.z * dpr;
        const py = s.y + mouseY * 14 * s.z * dpr;
        ctx.globalAlpha = a * s.z;
        ctx.fillStyle = s.hue;
        ctx.beginPath();
        ctx.arc(px, py, s.r * dpr, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.1) {
          ctx.globalAlpha = a * s.z * 0.25;
          ctx.beginPath();
          ctx.arc(px, py, s.r * dpr * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life += 1;
        const t = sh.life / sh.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : (t > 0.7 ? Math.max(0, 1 - (t - 0.7) / 0.3) : 1);
        const tailX = sh.x - sh.vx * (sh.length / Math.hypot(sh.vx, sh.vy));
        const tailY = sh.y - sh.vy * (sh.length / Math.hypot(sh.vx, sh.vy));
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, sh.hue);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5 * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        if (sh.life > sh.maxLife) shooters.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    }

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

// ──────────────────────────────────────────────────────────────────
// Saturn rig — scroll-reactive 3D planet with rings
// ──────────────────────────────────────────────────────────────────
const SATURN_TARGETS = {
  'hero':    { x: 0,   y: 0,   scale: 1.00, rotZ:  0, ringTilt: 76, ringOpacity: 1.0,  planetOpacity: 1.0 },
  'o-nas':   { x: 28,  y: -2,  scale: 1.20, rotZ: -3, ringTilt: 78, ringOpacity: 0.9,  planetOpacity: 1.0 },
  'uslugi':  { x: -28, y:  6,  scale: 1.55, rotZ:  6, ringTilt: 86, ringOpacity: 1.0,  planetOpacity: 0.95 },
  'misje':   { x: 26,  y: -4,  scale: 1.30, rotZ: 10, ringTilt: 82, ringOpacity: 0.95, planetOpacity: 1.0 },
  'proces':  { x: -10, y:  8,  scale: 1.10, rotZ: -4, ringTilt: 74, ringOpacity: 0.85, planetOpacity: 0.95 },
  'opinie':  { x: 22,  y: 10,  scale: 0.90, rotZ: -8, ringTilt: 72, ringOpacity: 0.7,  planetOpacity: 0.85 },
  'faq':     { x: -20, y: 14,  scale: 0.75, rotZ:  4, ringTilt: 70, ringOpacity: 0.55, planetOpacity: 0.7 },
  'kontakt': { x: 10,  y: -22, scale: 1.10, rotZ: 12, ringTilt: 60, ringOpacity: 0.85, planetOpacity: 0.95 },
};
const SCENE_IDS = ['hero', 'o-nas', 'uslugi', 'misje', 'proces', 'opinie', 'faq', 'kontakt'];

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;

function SaturnRig({ accentHue = 330 }) {
  const rigRef = useRef(null);
  const ringsRef = useRef(null);
  const planetRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    let displayed = { ...SATURN_TARGETS.hero };
    const SMOOTH = 0.12;
    let t0 = performance.now();
    let raf;

    function getCurrent() {
      const vh = window.innerHeight;
      const center = window.scrollY + vh / 2;
      let prevId = SCENE_IDS[0], nextId = SCENE_IDS[0], localT = 0;

      const positions = SCENE_IDS.map(id => {
        const el = document.getElementById(id);
        if (!el) return { id, top: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return { id, top: window.scrollY + r.top, height: r.height };
      });

      for (let i = 0; i < positions.length; i++) {
        const cur = positions[i];
        const nxt = positions[i+1];
        const curMid = cur.top + cur.height / 2;
        if (!nxt) { prevId = cur.id; nextId = cur.id; localT = 0; break; }
        const nxtMid = nxt.top + nxt.height / 2;
        if (center >= curMid && center <= nxtMid) {
          prevId = cur.id; nextId = nxt.id;
          localT = (center - curMid) / (nxtMid - curMid);
          break;
        }
        if (center < curMid && i === 0) { prevId = cur.id; nextId = cur.id; localT = 0; break; }
      }

      return { prevId, nextId, localT: easeInOut(Math.max(0, Math.min(1, localT))) };
    }

    function frame(now) {
      const { prevId, nextId, localT } = getCurrent();
      const A = SATURN_TARGETS[prevId] || SATURN_TARGETS.hero;
      const B = SATURN_TARGETS[nextId] || SATURN_TARGETS.hero;

      const target = {
        x: lerp(A.x, B.x, localT),
        y: lerp(A.y, B.y, localT),
        scale: lerp(A.scale, B.scale, localT),
        rotZ: lerp(A.rotZ, B.rotZ, localT),
        ringTilt: lerp(A.ringTilt, B.ringTilt, localT),
        ringOpacity: lerp(A.ringOpacity, B.ringOpacity, localT),
        planetOpacity: lerp(A.planetOpacity, B.planetOpacity, localT),
      };

      for (const k of Object.keys(displayed)) {
        displayed[k] = lerp(displayed[k], target[k], SMOOTH);
      }

      if (rigRef.current) {
        const xpx = (displayed.x / 100) * window.innerWidth;
        const ypx = (displayed.y / 100) * window.innerHeight;
        const t = (now - t0) / 1000;
        const bobY = Math.sin(t * 0.7) * 6;
        rigRef.current.style.transform = `translate3d(${xpx}px, ${ypx + bobY}px, 0) scale(${displayed.scale}) rotateZ(${displayed.rotZ}deg)`;
      }
      if (ringsRef.current) {
        ringsRef.current.style.transform = `translate3d(-50%, -50%, 0) rotateX(${displayed.ringTilt}deg) rotateZ(-18deg)`;
        ringsRef.current.style.opacity = String(displayed.ringOpacity);
      }
      if (planetRef.current) {
        planetRef.current.style.opacity = String(displayed.planetOpacity);
      }
      raf = requestAnimationFrame(frame);
    }

    const onMouseMove = (e) => {
      if (!planetRef.current || !glowRef.current) return;
      const rect = planetRef.current.getBoundingClientRect();
      // Position cursor relative to planet bounding box, clamped softly so the
      // glow can hug the edge but never escapes (overflow:hidden enforces it).
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      const clX = Math.max(8, Math.min(92, px));
      const clY = Math.max(8, Math.min(92, py));
      glowRef.current.style.setProperty('--glow-x', `${clX}%`);
      glowRef.current.style.setProperty('--glow-y', `${clY}%`);
    };

    window.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // accent-driven palette
  const c1 = `oklch(0.68 0.27 ${accentHue})`;
  const c2 = `oklch(0.78 0.18 ${(accentHue + 40) % 360})`;
  const cDeep = `oklch(0.22 0.15 ${accentHue})`;
  // Alpha-aware variants (oklch suffix-hex like `${c1}66` is invalid CSS — must use space-syntax with /alpha)
  const c1a = (a) => `oklch(0.68 0.27 ${accentHue} / ${a})`;
  const c2a = (a) => `oklch(0.78 0.18 ${(accentHue + 40) % 360} / ${a})`;
  const violetA = (a) => `oklch(0.55 0.25 ${(accentHue + 300) % 360} / ${a})`;

  const ringColors = [
    `color-mix(in oklch, ${c1} 8%, transparent)`,
    `color-mix(in oklch, ${c2} 22%, transparent)`,
    `color-mix(in oklch, ${c1} 14%, transparent)`,
    `color-mix(in oklch, ${c2} 30%, transparent)`,
    `color-mix(in oklch, ${c1} 22%, transparent)`,
    `color-mix(in oklch, ${c2} 40%, transparent)`,
  ];
  const ringWidths = [1040, 960, 900, 830, 780, 720];
  const ringWeights = [1, 4, 1, 8, 2, 6];

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none flex items-center justify-center" style={{ perspective: '1400px' }}>
      <div ref={rigRef} className="absolute will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        <div ref={ringsRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
          {ringWidths.map((w, i) => (
            <div key={w} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: `${w}px`, height: `${w}px`, borderColor: ringColors[i], borderWidth: `${ringWeights[i]}px`, borderStyle: 'solid', boxShadow: i === 5 ? `0 0 40px ${c1}40` : 'none' }} />
          ))}
        </div>

        <div ref={planetRef} className="rounded-full absolute overflow-hidden"
          style={{
            width: '380px', height: '380px', left: '-190px', top: '-190px',
            background: `radial-gradient(circle at 70% 75%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 35% 32%, ${c1} 0%, ${c2} 14%, ${c1} 32%, ${cDeep} 78%, #000000 100%)`,
            boxShadow: `inset -22px -28px 70px rgba(0,0,0,0.9), inset 14px 16px 44px rgba(255,255,255,0.1), 0 0 80px ${c1}55, 0 0 200px ${c1}30`
          }}>
          <div className="absolute inset-0 rounded-full mix-blend-soft-light opacity-70 pointer-events-none"
            style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.00) 0%,rgba(255,255,255,0.05) 28%,rgba(0,0,0,0.00) 50%,rgba(255,128,0,0.05) 72%,rgba(255,0,128,0.00) 100%)' }} />
          <div className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none"
            style={{ background: 'radial-gradient(circle at 38% 30%,rgba(255,255,255,0.2) 0%,rgba(255,255,255,0) 28%)' }} />
          {/* Dynamic light source — follows cursor across planet surface.
              Three layered radials: hot orange-yellow core, pink mid, violet falloff.
              Stays inside the sphere thanks to overflow:hidden on planetRef. */}
          <div ref={glowRef} className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            {/* Outer pink/orange halo */}
            <div className="absolute"
              style={{
                width: '290px', height: '290px',
                left: 'var(--glow-x, 35%)', top: 'var(--glow-y, 30%)',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle,
                  oklch(0.7 0.22 45 / 0.3) 0%,
                  ${c1a(0.2)} 40%,
                  transparent 72%)`,
                filter: 'blur(20px)', mixBlendMode: 'screen',
                transition: 'left 1500ms cubic-bezier(0.22, 1, 0.36, 1), top 1500ms cubic-bezier(0.22, 1, 0.36, 1)'
              }} />
            {/* Mid orange */}
            <div className="absolute"
              style={{
                width: '190px', height: '190px',
                left: 'var(--glow-x, 35%)', top: 'var(--glow-y, 30%)',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, oklch(0.78 0.21 55 / 0.5) 0%, oklch(0.7 0.22 45 / 0.25) 40%, transparent 75%)`,
                filter: 'blur(12px)', mixBlendMode: 'screen',
                transition: 'left 1250ms cubic-bezier(0.22, 1, 0.36, 1), top 1250ms cubic-bezier(0.22, 1, 0.36, 1)'
              }} />
            {/* Hot yellow/orange core */}
            <div className="absolute"
              style={{
                width: '110px', height: '110px',
                left: 'var(--glow-x, 35%)', top: 'var(--glow-y, 30%)',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle,
                  oklch(0.92 0.19 75 / 0.65) 0%,
                  oklch(0.82 0.22 55 / 0.5) 35%,
                  oklch(0.72 0.23 40 / 0.28) 65%,
                  transparent 85%)`,
                filter: 'blur(7px)', mixBlendMode: 'screen',
                transition: 'left 1000ms cubic-bezier(0.22, 1, 0.36, 1), top 1000ms cubic-bezier(0.22, 1, 0.36, 1)'
              }} />
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 pointer-events-none rounded-full"
          style={{ width: '380px', height: '80px', transform: 'translate(-50%,-42%)', background: 'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 40%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0) 100%)', filter: 'blur(6px)', mixBlendMode: 'multiply', opacity: 0.7 }} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Spaceships drifting across viewport
// ──────────────────────────────────────────────────────────────────
function SpaceshipLayer({ enabled = true }) {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    if (!enabled) { setShips([]); return; }
    let shipId = 0;
    let timers = [];

    const spawnShip = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const goingRight = Math.random() < 0.5;
      const startY = 60 + Math.random() * (H * 0.55);
      const endY = startY + (Math.random() * 60 - 30);
      const startX = goingRight ? -80 : W + 80;
      const endX = goingRight ? W + 80 : -80;
      const tilt = ((endY - startY) / Math.abs(endX - startX)) * 18;
      const duration = 6.5 + Math.random() * 4;

      const ship = { id: shipId++, startX, startY, endX, endY, duration, goingRight, tilt: goingRight ? tilt : -tilt };
      setShips(prev => [...prev, ship]);
      const t = setTimeout(() => setShips(prev => prev.filter(s => s.id !== ship.id)), duration * 1000 + 500);
      timers.push(t);
    };

    const loop = () => {
      const gap = 12000 + Math.random() * 16000;
      const t = setTimeout(() => {
        if (!document.hidden) spawnShip();
        loop();
      }, gap);
      timers.push(t);
    };

    const initT = setTimeout(() => { if (!document.hidden) spawnShip(); loop(); }, 5000);
    timers.push(initT);

    return () => { timers.forEach(clearTimeout); };
  }, [enabled]);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {ships.map(ship => (
        <div key={ship.id} className="absolute w-9 h-3 flex items-center"
          style={{
            transform: `translate(${ship.startX}px, ${ship.startY}px) rotate(${ship.tilt}deg) ${ship.goingRight ? '' : 'scaleX(-1)'}`,
            animation: `shipFly-${ship.id} ${ship.duration}s linear forwards`
          }}>
          <style>{`
            @keyframes shipFly-${ship.id} {
              0% { transform: translate(${ship.startX}px, ${ship.startY}px) rotate(${ship.tilt}deg) ${ship.goingRight ? '' : 'scaleX(-1)'}; opacity: 0; }
              8% { opacity: 1; }
              92% { opacity: 1; }
              100% { transform: translate(${ship.endX}px, ${ship.endY}px) rotate(${ship.tilt}deg) ${ship.goingRight ? '' : 'scaleX(-1)'}; opacity: 0; }
            }
          `}</style>
          <div className="absolute right-8 top-1 w-6 h-1 rounded-full" style={{ background: 'linear-gradient(to left, rgba(255,128,0,0.85), rgba(255,0,127,0.4), transparent)', filter: 'blur(1px)' }} />
          <div className="absolute left-2 top-0.5" style={{ width: '22px', height: '8px', background: 'linear-gradient(to bottom, #fff, #a1a1aa, #18181b)', borderRadius: '50% 30% 30% 50% / 50% 50% 50% 50%', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.4)' }} />
          <div className="absolute" style={{ left: '14px', top: '3px', width: '6px', height: '4px', background: 'radial-gradient(circle at 35% 35%, #FF8000, #FF0080 60%, #3d0012)', borderRadius: '50%', boxShadow: '0 0 6px rgba(255,128,0,0.9)' }} />
          <div className="absolute" style={{ right: '6px', top: 0, width: '8px', height: '12px', background: 'linear-gradient(to bottom right, #ff007f, #400020)', clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }} />
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Custom cursor — pink ring + dot
// ──────────────────────────────────────────────────────────────────
function CustomCursor({ enabled = true }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };

    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    const sel = 'a, button, input, textarea, .bento-card, [data-cursor-hover]';
    const attach = () => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
      });
    };
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });
    attach();

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <React.Fragment>
      <div ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference rounded-full border transition-[width,height] duration-200 ease-out ${isHovered ? 'w-[64px] h-[64px]' : 'w-[40px] h-[40px]'}`}
        style={{ borderColor: '#ff007f', boxShadow: isHovered ? '0 0 20px rgba(255,0,127,0.4)' : 'none' }} />
      <div ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference w-[6px] h-[6px] rounded-full"
        style={{ background: '#fff' }} />
    </React.Fragment>
  );
}

Object.assign(window, { Starfield, SaturnRig, SpaceshipLayer, CustomCursor });
