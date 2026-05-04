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

  return (
    <React.Fragment>
      {/* Bottom telemetry strip */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none hidden md:block">
        <div className="mx-4 mb-3 px-5 py-2.5 rounded-full border border-white/10 bg-black/70 backdrop-blur-xl flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-zinc-400 pointer-events-auto">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-1 animate-pulse" />
              <span className="text-pink-1">{active.code}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-white">{active.label}</span>
            </span>
            <span className="hidden lg:inline">ALT <span className="text-white">{altitude} km</span></span>
            <span className="hidden lg:inline">VEL <span className="text-white">{velocity} km/s</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden lg:inline">N 52.23° · E 21.01°</span>
            <span>{time}</span>
            <span className="text-pink-1">{Math.round(progress * 100).toString().padStart(2, '0')}%</span>
          </div>
        </div>
      </div>

      {/* Right-edge orbit rail */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col items-center gap-3 pointer-events-auto">
        <div className="relative w-px" style={{ height: '320px' }}>
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute left-0 top-0 w-px bg-gradient-to-b from-pink-1 via-orange-1 to-pink-1"
            style={{ height: `${progress * 100}%`, boxShadow: '0 0 8px rgba(255,0,127,0.8)' }} />
          {SECTIONS.map((sec, i) => {
            const top = (i / (SECTIONS.length - 1)) * 100;
            const isActive = sec.id === active.id;
            return (
              <a key={sec.id} href={`#${sec.id}`}
                className="absolute flex items-center gap-3 group"
                style={{ top: `${top}%`, right: 0, transform: 'translateY(-50%)' }}>
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase whitespace-nowrap transition-all"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)', textShadow: isActive ? '0 0 10px rgba(255,0,127,0.6)' : 'none' }}>
                  {sec.label}
                </span>
                <span className="block rounded-full border transition-all"
                  style={{
                    width: isActive ? '10px' : '6px',
                    height: isActive ? '10px' : '6px',
                    borderColor: isActive ? '#ff007f' : 'rgba(255,255,255,0.3)',
                    background: isActive ? '#ff007f' : 'transparent',
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
