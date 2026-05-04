// Main App component for Cosmo Bloom

const { useState, useEffect, useRef } = React;

// ─── Loader ───
function Loader({ gone }) {
  const [removed, setRemoved] = useState(false);
  useEffect(() => {
    if (gone) {
      const t = setTimeout(() => setRemoved(true), 800);
      return () => clearTimeout(t);
    }
  }, [gone]);
  if (removed) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-7 transition-opacity duration-700"
      style={{ opacity: gone ? 0 : 1, pointerEvents: gone ? 'none' : 'auto' }}>
      <div className="w-[90px] h-[90px] rounded-full relative" style={{ animation: 'spin 4s linear infinite' }}>
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(ellipse at 35% 32%,#FF0080,#FF8000 50%,#3d0012 90%)', boxShadow: '0 0 60px rgba(255,0,128,0.6)' }} />
        <div className="absolute rounded-full"
          style={{ inset: '-22px -50px', border: '2px solid rgba(255,128,128,0.55)', transform: 'rotateX(75deg)' }} />
      </div>
      <div className="font-mono text-[11px] text-zinc-300 tracking-[0.3em]">COSMO BLOOM · USTANAWIANIE ORBITY</div>
    </div>
  );
}

// ─── Reveal-on-scroll wrapper ───
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); obs.disconnect(); }
    }, { threshold: 0.18 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 800ms ease ${delay}ms, transform 800ms ease ${delay}ms`
      }}>
      {children}
    </div>
  );
}

// ─── FAQ accordion item ───
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/10 py-[22px] cursor-pointer group" onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center font-display text-[1.15rem] font-semibold gap-6 text-glow-pink">
        {question}
        <span className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${open ? 'rotate-45 border-pink-1 text-pink-1' : 'border-white/20'}`}
          style={{ boxShadow: open ? '0 0 20px rgba(255,0,127,0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
      </div>
      <div className="text-zinc-200 leading-relaxed text-[0.95rem] overflow-hidden transition-all duration-400"
        style={{ maxHeight: open ? '200px' : '0', marginTop: open ? '14px' : '0', opacity: open ? 1 : 0 }}>
        {answer}
      </div>
    </div>
  );
}

// ─── Animated counter ───
function Counter({ to, suffix = '', duration = 1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(to * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Mission card (NEW section) ───
function MissionCard({ idx, name, sector, metric, metricLabel, color }) {
  return (
    <div className="bento-card group relative overflow-hidden">
      <div className="aspect-[16/10] rounded-2xl mb-6 overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
        {/* Subtle striped placeholder */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 14px)' }} />
        {/* Glowing orbit ring */}
        <div className="absolute inset-[20%] rounded-full border border-white/15"
          style={{ borderColor: color, boxShadow: `0 0 40px ${color}55, inset 0 0 30px ${color}22` }} />
        <div className="absolute inset-[35%] rounded-full"
          style={{ background: `radial-gradient(circle at 35% 35%, ${color}, ${color}77 40%, transparent 70%)`, filter: 'blur(2px)' }} />
        <div className="absolute top-3 left-4 font-mono text-[9px] tracking-[0.3em] text-white/50">CASE STUDY · {idx}</div>
        <div className="absolute bottom-3 right-4 font-mono text-[9px] tracking-[0.3em] text-white/40">[ZAŁOGA NA POKŁADZIE]</div>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-display text-2xl font-bold text-white">{name}</h3>
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-300 uppercase">{sector}</span>
      </div>
      <div className="flex items-end gap-3 mt-4 pt-4 border-t border-white/10">
        <span className="font-display text-4xl font-bold" style={{ color }}>{metric}</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-200 uppercase pb-2">{metricLabel}</span>
      </div>
    </div>
  );
}

// ─── Service row card ───
function ServiceCard({ idx, title, text, icon }) {
  return (
    <div className="group relative bento-card transition-all duration-500">
      <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: 'linear-gradient(to top right, rgba(255,0,127,0.1), transparent)' }} />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="font-mono text-[11px] text-zinc-300 tracking-[0.3em] group-hover:text-pink-1 transition-colors">/{idx} — STACJA</span>
        <div className="w-[44px] h-[44px] rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-1 group-hover:scale-110 transition-all"
          style={{ transition: 'all 0.3s ease' }}>
          {icon}
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold text-white relative z-10">{title}</h3>
      <p className="text-zinc-300 text-[1rem] leading-relaxed max-w-[42ch] mt-4 relative z-10 group-hover:text-white transition-colors">{text}</p>
    </div>
  );
}

// ─── Icons (inline SVG, no library) ───
const Icon = {
  Globe: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>,
  Code: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>,
  Chart: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 6-6"/></svg>,
  Shield: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>,
  Mail: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>,
  Phone: (p) => <svg {...p} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg>,
  Arrow: (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  ArrowUp: (p) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>,
};

function App() {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [loading, setLoading] = useState(true);

  // contact form state
  const [form, setForm] = useState({ name: '', email: '', budget: '', message: '', website: '' });
  const [formState, setFormState] = useState('idle'); // idle | sending | success | error
  const [formError, setFormError] = useState(null);
  const [invalidFields, setInvalidFields] = useState([]);

  const updateField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // Smooth-scroll for nav anchors
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formState === 'sending') return;

    // klientowa walidacja — szybki feedback bez round-tripu
    const bad = [];
    if (form.name.trim().length < 2) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) bad.push('email');
    if (form.message.trim().length < 10) bad.push('message');
    if (bad.length) {
      setInvalidFields(bad);
      setFormState('error');
      setFormError('Sprawdź zaznaczone pola — minimum: imię, poprawny email, opis (10+ znaków).');
      return;
    }
    setInvalidFields([]);
    setFormError(null);
    setFormState('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setFormState('success');
        setForm({ name: '', email: '', budget: '', message: '', website: '' });
      } else if (res.status === 422 && Array.isArray(data.fields)) {
        setInvalidFields(data.fields);
        setFormState('error');
        setFormError('Niektóre pola wymagają poprawy.');
      } else if (res.status === 429) {
        setFormState('error');
        setFormError('Zbyt wiele prób. Spróbuj ponownie za chwilę.');
      } else {
        setFormState('error');
        setFormError(data.error || 'Coś poszło nie tak. Spróbuj ponownie lub napisz mailem.');
      }
    } catch (err) {
      setFormState('error');
      setFormError('Brak połączenia. Sprawdź sieć i spróbuj ponownie.');
    }
  };

  const isInvalid = (k) => invalidFields.includes(k);
  const buttonLabel =
    formState === 'sending' ? 'TRANSMITUJĘ…' :
    formState === 'success' ? '✓ SYGNAŁ ODEBRANY · ODPOWIEMY W 24H' :
    'WYŚLIJ SYGNAŁ →';

  const navItems = [
    { id: 'hero', label: 'START' },
    { id: 'o-nas', label: 'O NAS' },
    { id: 'uslugi', label: 'USŁUGI' },
    { id: 'misje', label: 'MISJE' },
    { id: 'proces', label: 'PROCES' },
    { id: 'faq', label: 'FAQ' },
    { id: 'kontakt', label: 'KONTAKT' },
  ];

  return (
    <div className="relative font-sans text-white bg-black" style={{ '--accent-hue': tweaks.accentHue }}>
      <Loader gone={!loading} />
      <CustomCursor enabled={tweaks.cursor} />
      <Starfield intensity={tweaks.motion} />
      <SpaceshipLayer enabled={tweaks.ships && tweaks.motion > 0.3} />
      <SaturnRig accentHue={tweaks.accentHue} />
      {tweaks.hud && <HUD />}

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-4 md:px-12 md:py-6 pointer-events-none">
        <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tight pointer-events-auto text-glow-pink">
          <div className="w-[28px] h-[28px] rounded-full relative bg-pink-1"
            style={{ boxShadow: '0 0 20px rgba(255,0,127,0.6)' }}>
            <div className="absolute inset-1 rounded-full bg-black/20" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
          Cosmo Bloom
        </div>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9 font-mono text-[11px] tracking-[0.2em] pointer-events-auto px-6 py-2.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
          {navItems.map(item => (
            <a key={item.id} href={`#${item.id}`}
              className="text-white/80 hover:text-pink-1 transition-all">
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#kontakt" className="px-6 py-3 rounded-full bg-pink-1 text-white border border-pink-1 font-mono text-[11px] tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all pointer-events-auto group flex items-center gap-2"
          style={{ boxShadow: '0 0 15px rgba(255,0,127,0.3)' }}>
          WSPÓŁPRACA <Icon.Arrow className="group-hover:translate-x-1 transition-transform" />
        </a>
      </header>

      <main className="relative z-10">

        {/* HERO */}
        <section id="hero" className="min-h-screen flex items-center px-[6vw] pt-[12vh]">
          <div className="max-w-4xl relative">
            {/* Vignette behind hero text — keeps title readable when planet drifts behind it */}
            <div aria-hidden className="absolute pointer-events-none -z-[1]"
              style={{
                left: '-8%', top: '-10%', right: '-20%', bottom: '-10%',
                background: 'radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0) 70%)',
                filter: 'blur(8px)'
              }} />
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-pink-1/5 border border-pink-1/30 font-mono text-[11px] tracking-[0.2em] text-pink-1 mb-7"
              style={{ boxShadow: '0 0 20px rgba(255,0,127,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-pink-1" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
              SEZON 2026 · NOWE PROJEKTY · 3 MIEJSCA
            </div>

            <h1 className="font-display font-bold tracking-[-0.03em] max-w-[14ch] text-glow-pink"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)', lineHeight: 1.32, paddingBottom: '0.3em', overflow: 'visible' }}>
              Projektujemy Twoją{' '}<span style={{ display: 'inline-block', overflow: 'visible', paddingBottom: '0.4em' }}>
                <em className="italic"
                  style={{
                    background: 'linear-gradient(120deg,#FF0080,#FF8000,#FF0080)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    display: 'inline-block',
                    lineHeight: 1.5,
                    paddingBottom: '0.4em',
                    paddingRight: '0.1em',
                    fontStyle: 'italic'
                  }}>
                  Orbitę Sukcesu
                </em>
              </span>
            </h1>

            <p className="max-w-[50ch] text-zinc-100 leading-relaxed mt-7 border-l-2 border-pink-1/60 pl-6"
              style={{ fontSize: 'clamp(1rem, 1.1vw, 1.15rem)' }}>
              Cosmo Bloom buduje strony i aplikacje webowe, które zatrzymują wzrok i przenoszą biznes na wyższy poziom. Łączymy rzemiosło z nowoczesną inżynierią.
            </p>

            <div className="flex gap-4 mt-12 flex-wrap">
              <a href="#kontakt" className="px-8 py-4 rounded-full bg-pink-1 text-white font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:-translate-y-1 transition-all flex items-center gap-2"
                style={{ boxShadow: '0 10px 40px rgba(255,0,127,0.4)' }}>
                Zacznij projekt <Icon.ArrowUp />
              </a>
              <a href="#uslugi" className="px-8 py-4 rounded-full border border-white/30 bg-white/5 backdrop-blur-md font-mono text-xs uppercase tracking-[0.2em] hover:border-pink-1 hover:text-pink-1 transition-all">
                Zobacz usługi
              </a>
            </div>

            {/* Hero stat strip */}
            <div className="mt-20 flex flex-wrap gap-x-12 gap-y-5 font-mono text-[10px] tracking-[0.25em] text-zinc-300 uppercase max-w-[700px]">
              <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-pink-1" /> 8 inżynierów na pokładzie</div>
              <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-orange-1" /> Warszawa · 3 strefy czasowe</div>
              <div className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-pink-1" /> Cykl 7 dni od kick-offu</div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="o-nas" className="min-h-screen flex items-center justify-start px-[6vw] py-[12vh]">
          <Reveal className="max-w-[600px] bg-white/5 border border-white/10 rounded-[24px] p-10 backdrop-blur-2xl"
            style={{ boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
            <div className="font-mono text-[11px] text-orange-1 tracking-[0.3em] mb-4">[01] STUDIO · OD 2021</div>
            <h2 className="font-display font-bold leading-[1] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4rem)' }}>Niewielki zespół.<br/>Wielka grawitacja.</h2>
            <p className="text-zinc-300 leading-relaxed">Jesteśmy ośmioosobowym studiem projektowo-inżynierskim z bazą w Warszawie i orbitą rozciągniętą na trzy strefy czasowe. Cosmo Bloom pracuje w cyklach krótkich, przejrzystych i mierzonych.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
              {[
                { num: '01', title: 'Rzemiosło', text: 'Detal, którego nikt nie zauważa, ale każdy czuje.' },
                { num: '02', title: 'Tempo', text: 'Widoczny postęp w 7 dni od kick-offu.' },
                { num: '03', title: 'Jasność', text: 'Wycena bez dopisków drobnym drukiem.' }
              ].map(v => (
                <div key={v.num} className="border border-white/10 rounded-2xl p-5 bg-white/5 hover:border-pink-1 transition-all">
                  <div className="font-mono text-[11px] text-orange-1 tracking-[0.2em]">/{v.num}</div>
                  <h4 className="font-display mt-2 font-bold uppercase text-xs tracking-widest">{v.title}</h4>
                  <p className="text-[0.8rem] text-zinc-200 mt-2 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* SERVICES */}
        <section id="uslugi" className="min-h-screen px-[6vw] py-[16vh] block">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-32">
                <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em]">[02] ORBITA USŁUG</div>
                <h2 className="font-display font-bold leading-[0.98] mt-3.5"
                  style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}>Cztery stacje wzdłuż pierścienia.</h2>
                <p className="text-zinc-300 text-[0.95rem] leading-relaxed mt-3.5">Każda stacja jest niezależna. Razem tworzą zamknięty cykl — od pomysłu do utrzymania.</p>
                <div className="mt-8 font-mono text-[10px] tracking-[0.25em] text-zinc-300 space-y-2">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span>STATUS</span><span className="text-pink-1">● PRZYJMUJEMY</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span>NAJBLIŻSZY KICK-OFF</span><span className="text-white">3 TYG.</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span>STAWKA HR</span><span className="text-white">OD 320 PLN</span></div>
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-[18px]">
              {[
                { idx: '01', title: 'Projektowanie produktu', text: 'Architektura informacji, wireframes, system designu i prototypy. Każdy ekran rozwiązuje konkretny problem użytkownika.', icon: <Icon.Globe /> },
                { idx: '02', title: 'Strony i aplikacje', text: 'Next.js, Astro, headless CMS. Strony, które ładują się w ułamku sekundy i nie kruszą się pod ruchem.', icon: <Icon.Code /> },
                { idx: '03', title: 'SEO i Performance', text: 'Audyt techniczny, struktura treści, optymalizacja wydajności. Cel: zielone metryki i wysokie pozycje.', icon: <Icon.Chart /> },
                { idx: '04', title: 'Opieka techniczna', text: 'Monitoring 24/7, kopie zapasowe, aktualizacje, drobne zmiany. Strona działa, a Ty śpisz spokojnie.', icon: <Icon.Shield /> },
              ].map(s => (
                <Reveal key={s.idx}>
                  <ServiceCard {...s} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MISJE — NEW portfolio section */}
        <section id="misje" className="min-h-screen px-[6vw] py-[16vh]">
          <div className="max-w-[1280px] mx-auto">
            <Reveal className="mb-16 max-w-[640px]">
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em]">[03] WYBRANE MISJE</div>
              <h2 className="font-display font-bold leading-[0.98] mt-3.5"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>Trzy zakończone misje, <span className="text-pink-1">trzy konkretne wyniki.</span></h2>
              <p className="text-zinc-300 leading-relaxed mt-4 text-[1rem]">Nie pokazujemy mock-upów. Pokazujemy projekty, które polecieliśmy do końca — i metryki, które zostały po starcie.</p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { idx: '01', name: 'Northwind Labs', sector: 'SaaS · B2B', metric: '+240%', metricLabel: 'konwersji', color: '#ff007f' },
                { idx: '02', name: 'Aurelia Capital', sector: 'Fintech', metric: '0.6s', metricLabel: 'czas LCP', color: '#ff8000' },
                { idx: '03', name: 'Helia Climate', sector: 'Climate-tech', metric: '4.8x', metricLabel: 'leadów / mc', color: '#ff007f' },
              ].map(m => (
                <Reveal key={m.idx}><MissionCard {...m} /></Reveal>
              ))}
            </div>

            <Reveal className="mt-10">
              <a href="#kontakt" className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-zinc-300 hover:text-pink-1 transition-colors group">
                <span className="w-12 h-px bg-zinc-600 group-hover:bg-pink-1 transition-colors" />
                ZOBACZ PEŁNE STUDIA PRZYPADKÓW <Icon.Arrow className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* PROCESS */}
        <section id="proces" className="min-h-screen px-[6vw] py-[16vh]" style={{ background: 'rgba(8,8,8,0.3)' }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-20 text-center">
              <div className="font-mono text-[11px] text-orange-1 tracking-[0.3em] uppercase">[ 04 · METODOLOGIA ]</div>
              <h2 className="font-display font-bold leading-none mt-4"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>Droga od pomysłu<br/>do <span className="text-pink-1">skalowalnego wzrostu.</span></h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Analiza & Strategia', desc: 'Rozumiemy Twój biznes i cele. Definiujemy KPI i ścieżkę użytkownika.', days: 'TYDZIEŃ 1' },
                { step: '02', title: 'Prototypowanie', desc: 'Szybkie iteracje designu. Zobacz i poczuj swój produkt w 7 dni.', days: 'TYDZIEŃ 2' },
                { step: '03', title: 'Engineering', desc: 'Czysta architektura, skalowalna baza i najwyższa wydajność.', days: 'TYDZIEŃ 3' },
                { step: '04', title: 'Wdrożenie & Skalowanie', desc: 'Monitoring wyników i ciągła optymalizacja dla maksymalnych zysków.', days: 'TYDZIEŃ 4' },
              ].map((p, i) => (
                <Reveal key={i} delay={i * 80} className="h-full">
                  <div className="bento-card flex flex-col group h-full">
                    <div className="w-full flex items-center justify-between">
                      <div className="text-4xl font-display font-black text-pink-1/20 group-hover:text-pink-1/50 transition-colors">{p.step}</div>
                      <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-300">{p.days}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-5 min-h-[3.5rem]">{p.title}</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed group-hover:text-white transition-colors mt-5">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-20 flex justify-center">
              <div className="px-8 py-8 rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col md:flex-row items-center gap-12">
                {[
                  { val: 98, suf: '%', label: 'Zadowolenia klientów' },
                  { val: 150, suf: '+', label: 'Zrealizowanych orbit' },
                  { val: 24, suf: 'h', label: 'Czas reakcji' },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-12 bg-white/10 hidden md:block" />}
                    <div className="flex flex-col items-center min-w-[140px]">
                      <span className="text-5xl font-display font-bold text-pink-1"><Counter to={s.val} suffix={s.suf} /></span>
                      <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mt-2">{s.label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="opinie" className="min-h-screen px-[6vw] py-[12vh]">
          <div className="max-w-[1200px] mx-auto w-full">
            <Reveal className="mb-9">
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em]">[05] SYGNAŁY Z RYNKU</div>
              <h2 className="font-display font-bold leading-[0.98] mt-3.5"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>Co mówią ci, którzy nam zaufali.</h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              {[
                { name: 'Marta Kuznetsova', role: 'CEO', quote: 'Cosmo Bloom to nie tylko studio, to partnerzy, którzy przenieśli nasz design na wyższy poziom. Konwersja wzrosła o 240%.', initials: 'MK' },
                { name: 'Piotr Janczak', role: 'CTO', quote: 'Dbałość o detale i jakość kodu na poziomie, którego nie spotkałem wcześniej u żadnej agencji zewnętrznej.', initials: 'PJ' },
              ].map((q, i) => (
                <Reveal key={i}>
                  <div className="bg-white/5 border border-white/10 rounded-[18px] p-8 backdrop-blur-lg h-full flex flex-col justify-between"
                    style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                    <p className="text-white leading-relaxed text-[1.1rem] italic mb-6">„{q.quote}”</p>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg,#FF0080,#FF8000)' }}>{q.initials}</div>
                      <div>
                        <div className="font-display text-[1rem] font-bold text-pink-1">{q.name}</div>
                        <div className="font-mono text-[10px] text-zinc-300 tracking-[0.1em] uppercase">{q.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="min-h-screen px-[6vw] py-[12vh]">
          <Reveal className="max-w-[800px] mx-auto w-full">
            <div className="font-mono text-[11px] text-orange-1 tracking-[0.2em]">[06] CZĘSTE PYTANIA</div>
            <h2 className="font-display font-bold leading-[0.98] mt-3.5 mb-10"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>Wiedza.</h2>
            <div className="flex flex-col">
              <FAQItem question="Ile kosztuje realizacja projektu?" answer="Każdy projekt wyceniamy indywidualnie po analizie Twoich potrzeb. Stosujemy model Fixed Price, co oznacza, że cena nie zmieni się w trakcie trwania prac." />
              <FAQItem question="Czy otrzymam wsparcie po uruchomieniu strony?" answer="Tak. Każdy projekt obejmuje 3 miesiące bezpłatnej opieki technicznej. Oferujemy również długoterminowe pakiety utrzymaniowe, aby Twoja strona zawsze była bezpieczna i aktualna." />
              <FAQItem question="Czy strona będzie poprawnie wyświetlać się na telefonach?" answer="Bezwzględnie. Projektujemy w podejściu Mobile-First. Twoja strona będzie zoptymalizowana pod kątem szybkości i wygody użytkowania na każdym urządzeniu." />
              <FAQItem question="Jak wygląda proces współpracy?" answer="Zaczynamy od warsztatu strategicznego, następnie tworzymy prototypy, design i finalny kod. Całość odbywa się w przejrzystych tygodniowych cyklach (sprintach)." />
              <FAQItem question="Czy pracujecie z firmami spoza Polski?" answer="Tak, regularnie. Komunikujemy się po polsku i angielsku, a nasze procesy są skrojone pod współpracę asynchroniczną w trzech strefach czasowych." />
            </div>
          </Reveal>
        </section>

        {/* CONTACT */}
        <section id="kontakt" className="min-h-screen px-[6vw] py-[12vh] flex items-center">
          <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em] mb-4">[07] KANAŁ KOMUNIKACJI</div>
              <h2 className="font-display font-bold tracking-tighter mb-8 leading-none"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Gotowy na<br/><span className="text-pink-1 text-glow-pink">Wielki Skok?</span>
              </h2>
              <p className="text-zinc-200 text-lg leading-relaxed mb-12 max-w-[44ch]">
                Niezależnie od tego, czy masz gotowy brief, czy tylko luźny pomysł — napisz do nas. Przeanalizujemy Twoje potrzeby i wrócimy z konkretami w 24h.
              </p>

              <div className="space-y-5">
                <a href="mailto:kontakt@cosmobloom.studio" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-pink-1 group-hover:border-pink-1 group-hover:bg-pink-1/10 transition-all">
                    <Icon.Mail />
                  </div>
                  <span className="text-lg font-medium group-hover:text-pink-1 transition-colors">kontakt@cosmobloom.studio</span>
                </a>
                <a href="tel:+48223058104" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-pink-1 group-hover:border-pink-1 group-hover:bg-pink-1/10 transition-all">
                    <Icon.Phone />
                  </div>
                  <span className="text-lg font-medium group-hover:text-pink-1 transition-colors">+48 22 305 81 04</span>
                </a>
              </div>

              <div className="mt-12 p-5 rounded-2xl border border-white/10 bg-white/[0.02] font-mono text-[10px] tracking-[0.25em] text-zinc-300 max-w-[420px]">
                <div className="text-pink-1 mb-2">● STACJA NASŁUCHOWA</div>
                <div>Pn–Pt · 09:00–17:00 CET</div>
                <div className="mt-1">ul. Wspólna 56 · 00-687 Warszawa</div>
              </div>
            </Reveal>

            <Reveal className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-[40px] backdrop-blur-2xl">
              <form onSubmit={handleSubmit} noValidate className="space-y-7">
                {/* honeypot — niewidoczny dla ludzi, kuszący dla botów */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                  <label>Strona www<input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={updateField('website')} /></label>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="cb-name" className="font-mono text-[10px] text-zinc-200 uppercase tracking-[0.3em]">Imię i nazwisko</label>
                  <input id="cb-name" name="name" autoComplete="name" required value={form.name} onChange={updateField('name')}
                    className={`bg-transparent border-b py-3 outline-none transition-colors text-white placeholder:text-zinc-400 ${isInvalid('name') ? 'border-pink-1' : 'border-white/20 focus:border-pink-1'}`}
                    placeholder="Jan Kowalski" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cb-email" className="font-mono text-[10px] text-zinc-200 uppercase tracking-[0.3em]">Email</label>
                  <input id="cb-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField('email')}
                    className={`bg-transparent border-b py-3 outline-none transition-colors text-white placeholder:text-zinc-400 ${isInvalid('email') ? 'border-pink-1' : 'border-white/20 focus:border-pink-1'}`}
                    placeholder="ty@firma.pl" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-zinc-200 uppercase tracking-[0.3em]">Budżet (orientacyjnie)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['< 30k', '30–80k', '80–200k', '> 200k'].map(b => (
                      <label key={b} className="cursor-pointer">
                        <input type="radio" name="budget" value={b} checked={form.budget === b} onChange={updateField('budget')} className="peer sr-only" />
                        <span className="px-4 py-2 rounded-full border border-white/15 text-[11px] font-mono tracking-[0.15em] peer-checked:bg-pink-1 peer-checked:border-pink-1 peer-checked:text-white text-zinc-400 hover:border-white/40 transition-all block">{b} PLN</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="cb-message" className="font-mono text-[10px] text-zinc-200 uppercase tracking-[0.3em]">Opisz swój projekt</label>
                  <textarea id="cb-message" name="message" required value={form.message} onChange={updateField('message')}
                    className={`bg-transparent border-b py-3 outline-none transition-colors min-h-[100px] text-white placeholder:text-zinc-400 ${isInvalid('message') ? 'border-pink-1' : 'border-white/20 focus:border-pink-1'}`}
                    placeholder="Strona webowa, termin marzec…" />
                </div>

                {formState === 'error' && formError && (
                  <div role="alert" className="font-mono text-[11px] tracking-[0.15em] text-pink-1 border border-pink-1/40 bg-pink-1/10 rounded-xl px-4 py-3">
                    {formError}
                  </div>
                )}
                {formState === 'success' && (
                  <div role="status" className="font-mono text-[11px] tracking-[0.15em] text-orange-1 border border-orange-1/40 bg-orange-1/10 rounded-xl px-4 py-3">
                    ✓ Sygnał odebrany. Wrócimy z konkretami w 24h.
                  </div>
                )}

                <button type="submit" disabled={formState === 'sending'}
                  className="w-full bg-pink-1 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-[#ff1a8c] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ boxShadow: '0 10px 40px rgba(255,0,127,0.4)' }}>
                  {buttonLabel}
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="px-[6vw] py-16 border-t border-white/5 relative z-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="font-display font-bold text-xl tracking-tighter text-white">COSMO BLOOM © 2026</div>
          <nav className="flex gap-8 font-mono text-[10px] tracking-widest text-zinc-300">
            <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
            <a href="#" className="hover:text-white transition-colors">DRIBBBLE</a>
            <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-white transition-colors">GITHUB</a>
          </nav>
          <div className="font-mono text-[9px] text-zinc-300 uppercase tracking-[0.4em]">ZBUDOWANE W KOSMOSIE · WARSZAWA</div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-white/5 flex justify-between font-mono text-[9px] tracking-[0.3em] text-zinc-400 uppercase">
          <span>NIP 521-37-91-204</span>
          <span>v 2026.05 · MISJA W BIEGU</span>
        </div>
      </footer>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks · Cosmo Bloom">
        <TweakSection label="Wygląd" />
        <TweakSlider label="Odcień akcentu" value={tweaks.accentHue} min={0} max={360} step={1} unit="°" onChange={v => setTweak('accentHue', v)} />
        <TweakSlider label="Gęstość gwiazd" value={tweaks.motion} min={0} max={1.4} step={0.1} onChange={v => setTweak('motion', v)} />
        <TweakSection label="Efekty" />
        <TweakToggle label="Niestandardowy kursor" value={tweaks.cursor} onChange={v => setTweak('cursor', v)} />
        <TweakToggle label="Statki kosmiczne" value={tweaks.ships} onChange={v => setTweak('ships', v)} />
        <TweakToggle label="HUD telemetrii" value={tweaks.hud} onChange={v => setTweak('hud', v)} />
      </TweaksPanel>
    </div>
  );
}

window.App = App;
