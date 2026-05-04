// HUD overlay (mission control telemetry) + scroll orbit rail

const { useEffect, useState } = React;

const SECTIONS = [
  { id: 'hero',    code: 'BLOOM-00', label: 'GŁÓWNA' },
  { id: 'o-nas',   code: 'BLOOM-01', label: 'STUDIO' },
  { id: 'uslugi',  code: 'BLOOM-02', label: 'USŁUGI' },
  { id: 'misje',   code: 'BLOOM-03', label: 'MISJE' },
  { id: 'proces',  code: 'BLOOM-04', label: 'PROCES' },
  { id: 'opinie',  code: 'BLOOM-05', label: 'SYGNAŁY' },
  { id: 'faq',     code: 'BLOOM-06', label: 'WIEDZA' },
  { id: 'kontakt', code: 'BLOOM-07', label: 'KANAŁ' },
];

function HUD() {
  const [time, setTime] = useState('');
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(SECTIONS[0]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s} UTC`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setProgress(p);

      const center = window.scrollY + window.innerHeight / 2;
      let current = SECTIONS[0];
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const top = el.offsetTop;
        if (center >= top) current = sec;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const altitude = (380 + progress * 1240).toFixed(0); // playful "altitude"
  const velocity = (7.4 + progress * 3.2).toFixed(2);

  // Progress measured along the rail itself: 0% = center of first dot, 100% = center of last dot.
  // This guarantees the glowing line tip lines up exactly with each dot's center as you scroll.
  const railProgress = Math.max(0, Math.min(1, progress));

  return (
    <React.Fragment>
      {/* Right-edge orbit rail — line passes exactly through dot centers */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[60] hidden md:block pointer-events-auto">
        <div className="relative" style={{ height: '320px', width: '10px' }}>
          {/* Track + progress line: positioned at the horizontal center of the dot column */}
          <div className="absolute top-0 bottom-0" style={{ left: '50%', width: '1px', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.10)' }} />
          <div className="absolute top-0"
            style={{
              left: '50%', width: '1px', transform: 'translateX(-50%)',
              height: `${railProgress * 100}%`,
              background: 'linear-gradient(to bottom, #ff007f, #ff8000, #ff007f)',
              boxShadow: '0 0 8px rgba(255,0,127,0.8)'
            }} />
          {SECTIONS.map((sec, i) => {
            const top = (i / (SECTIONS.length - 1)) * 100;
            const isActive = sec.id === active.id;
            const size = isActive ? 10 : 6;
            return (
              <a key={sec.id} href={`#${sec.id}`}
                className="absolute group"
                style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span className="absolute font-mono text-[9px] tracking-[0.25em] uppercase whitespace-nowrap transition-all"
                  style={{
                    right: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                    textShadow: isActive ? '0 0 10px rgba(255,0,127,0.6)' : 'none'
                  }}>
                  {sec.label}
                </span>
                <span className="block rounded-full border transition-all"
                  style={{
                    width: `${size}px`, height: `${size}px`,
                    borderColor: isActive ? '#ff007f' : 'rgba(255,255,255,0.3)',
                    background: isActive ? '#ff007f' : '#000',
                    boxShadow: isActive ? '0 0 12px rgba(255,0,127,0.8)' : 'none'
                  }} />
              </a>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { HUD });
