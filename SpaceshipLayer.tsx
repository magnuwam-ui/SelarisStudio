import { useEffect, useRef } from 'react';

const targets: Record<string, any> = {
  'hero':    { x:  0,  y:   0, scale: 1.00, rotZ:  0, ringTilt: 76, ringOpacity: 1.0,  planetOpacity: 1.0 },
  'o-nas':   { x:  18, y:  -2, scale: 1.20, rotZ: -3, ringTilt: 78, ringOpacity: 0.9,  planetOpacity: 1.0 },
  'uslugi':  { x: -28, y:   6, scale: 1.55, rotZ:  6, ringTilt: 86, ringOpacity: 1.0,  planetOpacity: 0.95 },
  'opinie':  { x:  22, y:  10, scale: 0.90, rotZ: -8, ringTilt: 72, ringOpacity: 0.7,  planetOpacity: 0.85 },
  'faq':     { x: -20, y:  14, scale: 0.75, rotZ:  4, ringTilt: 70, ringOpacity: 0.55, planetOpacity: 0.7 },
  'kontakt': { x:  10, y: -22, scale: 1.10, rotZ: 12, ringTilt: 60, ringOpacity: 0.85, planetOpacity: 0.95 },
};

const sceneIds = ['hero', 'o-nas', 'uslugi', 'opinie', 'faq', 'kontakt'];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }

export default function SaturnRig() {
  const rigRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let displayed = { ...targets.hero };
    const SMOOTH = 0.12; 
    let t0 = performance.now();

    function getCurrent() {
      const vh = window.innerHeight;
      const center = window.scrollY + vh / 2;
      let prevId = sceneIds[0], nextId = sceneIds[0], localT = 0;

      const positions = sceneIds.map(id => {
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

    function frame(now: number) {
      const { prevId, nextId, localT } = getCurrent();
      const A = targets[prevId];
      const B = targets[nextId];
      
      const target = {
        x: lerp(A.x, B.x, localT),
        y: lerp(A.y, B.y, localT),
        scale: lerp(A.scale, B.scale, localT),
        rotZ: lerp(A.rotZ, B.rotZ, localT),
        ringTilt: lerp(A.ringTilt, B.ringTilt, localT),
        ringOpacity: lerp(A.ringOpacity, B.ringOpacity, localT),
        planetOpacity: lerp(A.planetOpacity, B.planetOpacity, localT),
      };

      for (const k of Object.keys(displayed) as Array<keyof typeof displayed>) {
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

      requestAnimationFrame(frame);
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!planetRef.current || !glowRef.current) return;
      const planetRect = planetRef.current.getBoundingClientRect();
      const cx = planetRect.left + planetRect.width / 2;
      const cy = planetRect.top + planetRect.height / 2;
      const dx = (e.clientX - cx) / planetRect.width;
      const dy = (e.clientY - cy) / planetRect.height;
      const clampedX = Math.max(-0.7, Math.min(0.7, dx));
      const clampedY = Math.max(-0.7, Math.min(0.7, dy));
      glowRef.current.style.setProperty('--glow-x', `${50 + clampedX * 40}%`);
      glowRef.current.style.setProperty('--glow-y', `${50 + clampedY * 40}%`);
    };

    window.addEventListener('mousemove', onMouseMove);
    const animationId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-1 pointer-events-none perspective-1400 flex items-center justify-center">
      <div ref={rigRef} className="absolute preserve-3d will-change-transform">
        {/* Rings */}
        <div ref={ringsRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d pointer-events-none">
          {[1040, 960, 900, 830, 780, 720].map((width, i) => {
             const colors = [
               "rgba(255,0,128,0.04)", 
               "rgba(255,128,0,0.12)", 
               "rgba(255,0,128,0.08)",
               "rgba(255,128,0,0.18)",
               "rgba(255,0,128,0.12)",
               "rgba(255,128,0,0.25)"
             ];
             const borderWeights = [1, 4, 1, 8, 2, 6];
             return (
               <div 
                 key={width}
                 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-solid"
                 style={{ 
                   width: `${width}px`, 
                   height: `${width}px`, 
                   borderColor: colors[i], 
                   borderWidth: `${borderWeights[i]}px`,
                   boxShadow: i === 5 ? '0 0 40px rgba(255,0,127,0.05)' : 'none'
                 }}
               />
             );
          })}
        </div>

        {/* Planet Body */}
        <div 
          ref={planetRef} 
          className="w-[380px] h-[380px] rounded-full absolute left-[-190px] top-[-190px] shadow-[inset_-22px_-28px_70px_rgba(0,0,0,0.9),_inset_14px_16px_44px_rgba(255,255,255,0.1),_0_0_80px_rgba(255,0,128,0.3),_0_0_200px_rgba(255,0,128,0.1)] overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 70% 75%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 55%),
              radial-gradient(ellipse at 35% 32%, #FF0080 0%, #FF8000 14%, #FF0080 32%, #400020 78%, #000000 100%)
            `
          }}
        >
          {/* Atmosphere bands */}
          <div className="absolute inset-0 rounded-full mix-blend-soft-light opacity-70 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.00)_0%,rgba(255,255,255,0.05)_28%,rgba(0,0,0,0.00)_50%,rgba(255,128,0,0.05)_72%,rgba(255,0,128,0.00)_100%)]" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_28%)] mix-blend-screen pointer-events-none" />
          <div ref={glowRef} className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div 
              className="absolute w-[240px] h-[240px] translate-x-[-50%] translate-y-[-50%] bg-[radial-gradient(circle,rgba(255,128,0,0.6)_0%,rgba(255,128,0,0.2)_30%,rgba(255,128,0,0)_65%)] blur-[10px] transition-[left,top] duration-350"
              style={{ left: 'var(--glow-x, 30%)', top: 'var(--glow-y, 30%)' }}
            />
          </div>
        </div>

        {/* Ring shadow casting on planet */}
        <div className="absolute left-1/2 top-1/2 w-[380px] h-[80px] translate-x-[-50%] translate-y-[-42%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0)_100%)] rounded-full blur-[6px] pointer-events-none multiply opacity-70" />
      </div>
    </div>
  );
}
