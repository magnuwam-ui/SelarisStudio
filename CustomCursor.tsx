import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowRight,
  Globe, 
  Code2, 
  ShieldCheck,
  Plus,
  Mail,
  Phone,
  MapPin,
  Clock,
  LineChart
} from 'lucide-react';
import Starfield from './components/Starfield';
import SaturnRig from './components/SaturnRig';
import CustomCursor from './components/CustomCursor';
import SpaceshipLayer from './components/SpaceshipLayer';

// Loader Component
const Loader = ({ gone }: { gone: boolean }) => (
  <AnimatePresence>
    {!gone && (
      <motion.div 
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-7"
      >
        <div className="w-[90px] h-[90px] rounded-full relative animate-spin [animation-duration:4s]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_32%,#FF0080,#FF8000_50%,#3d0012_90%)] shadow-[0_0_60px_rgba(255,0,128,0.6)]" />
          <div className="absolute inset-[-22px_-50px] border-2 border-pink-1/55 rounded-full [transform:rotateX(75deg)]" />
        </div>
        <div className="font-mono text-[11px] text-zinc-500 tracking-[0.3em]">COSMO BLOOM &middot; ESTABLISHING ORBIT</div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Reveal Component
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  key?: React.Key;
}

const Reveal = ({ children, className = "", id = "" }: RevealProps) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.18 }}
    transition={{ duration: 0.8 }}
    className={className}
  >
    {children}
  </motion.div>
);

// FAQ Item
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-t border-white/10 py-[22px] cursor-none group" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex justify-between items-center font-display text-[1.15rem] font-semibold gap-6 text-glow-pink">
        {question}
        <span className={`w-7 h-7 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45 border-pink-1 text-pink-1 shadow-[0_0_20px_rgba(255,0,128,0.4)]' : ''}`}>
          <Plus size={18} />
        </span>
      </div>
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, marginTop: isOpen ? 14 : 0 }}
        className="text-zinc-500 leading-relaxed text-[0.95rem] overflow-hidden"
      >
        {answer}
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('TRANSMITTING…');
    setTimeout(() => {
      setFormStatus('✓ SYGNAŁ ODEBRANY · ODPOWIEMY W 24H');
      (e.target as HTMLFormElement).reset();
    }, 1100);
  };

  return (
    <div className="relative font-sans text-white selection:bg-pink-1 selection:text-white bg-black">
      <Loader gone={!isLoading} />
      <CustomCursor />
      <Starfield />
      <SpaceshipLayer />
      <SaturnRig />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-4 md:px-12 md:py-8 pointer-events-none bg-black/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <div className="flex items-center gap-3 font-display font-bold text-2xl tracking-tight pointer-events-auto text-glow-pink">
          <div className="w-[28px] h-[28px] rounded-full relative bg-accent shadow-[0_0_20px_rgba(255,0,127,0.6)]">
             <div className="absolute inset-1 rounded-full bg-black/20 animate-pulse" />
          </div>
          Cosmo Bloom
        </div>
        
        <nav className="hidden lg:flex items-center gap-10 font-mono text-[11px] tracking-[0.2em] pointer-events-auto">
          {[
            { id: 'hero', label: 'START' },
            { id: 'o-nas', label: 'O NAS' },
            { id: 'uslugi', label: 'USŁUGI' },
            { id: 'proces', label: 'PROCES' },
            { id: 'faq', label: 'FAQ' },
            { id: 'kontakt', label: 'KONTAKT' }
          ].map(item => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className="text-white hover:text-pink-1 hover:text-glow-pink transition-all font-bold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#kontakt" className="px-8 py-3 rounded-full bg-pink-1 text-white border border-pink-1 shadow-[0_0_15px_rgba(255,0,127,0.3)] font-mono text-[11px] tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all pointer-events-auto group">
          WSPÓŁPRACA <ArrowRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform" size={14} />
        </a>
      </header>

      <main className="relative z-10">
        
        {/* HERO */}
        <section id="hero" className="min-h-screen flex items-center px-[6vw] pt-[12vh]">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-pink-1/5 border border-pink-1/30 font-mono text-[11px] tracking-[0.2em] text-pink-1 mb-7 shadow-[0_0_20px_rgba(255,0,127,0.15)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-pink-1 animate-pulse" />
              SEZON 2026 · NOWE PROJEKTY
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-[clamp(2.5rem,7vw,7rem)] font-bold leading-[1.1] tracking-[-0.03em] max-w-[14ch] text-glow-pink"
            >
              Projektujemy Twoją <em className="italic bg-[linear-gradient(120deg,#FF0080,#FF8000,#FF0080)] bg-clip-text text-transparent">Orbitę Sukcesu</em>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-[50ch] text-zinc-100 text-[clamp(1rem,1.1vw,1.1rem)] leading-relaxed mt-7 border-l-2 border-pink-1/60 pl-6"
            >
              Cosmo Bloom buduje strony i aplikacje webowe, które zatrzymują wzrok i przenoszą biznes na wyższy poziom. Łączymy rzemiosło z nowoczesną inżynierią.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-4 mt-12 flex-wrap"
            >
              <a href="#kontakt" className="px-8 py-4 rounded-full bg-pink-1 text-white font-mono text-xs uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(255,0,127,0.4)] hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(255,0,127,0.6)] hover:-translate-y-1 transition-all">
                Zacznij projekt <ArrowUpRight className="inline-block ml-1" size={14} />
              </a>
              <a href="#uslugi" className="px-8 py-4 rounded-full border border-white/30 bg-white/5 backdrop-blur-md font-mono text-xs uppercase tracking-[0.2em] hover:border-pink-1 hover:text-pink-1 hover:shadow-[0_0_20px_rgba(255,0,127,0.2)] transition-all">
                Usługi
              </a>
            </motion.div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="o-nas" className="min-h-screen flex items-center justify-end px-[6vw] py-[12vh]">
          <Reveal className="max-w-[560px] bg-white/5 border border-white/10 rounded-[24px] p-10 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            <div className="font-mono text-[11px] text-orange-1 tracking-[0.3em] mb-4">[02] STUDIO · OD 2021</div>
            <h2 className="font-display font-bold text-[clamp(2.5rem,4.5vw,4rem)] leading-[1] mb-6">Niewielki zespół. <br/>Wielka grawitacja.</h2>
            <p className="text-zinc-300 leading-relaxed">Jesteśmy ośmioosobowym studiem projektowo-inżynierskim z bazą w Warszawie i orbitą rozciągniętą na trzy strefy czasowe. Cosmo Bloom pracuje w cyklach krótkich, przejrzystych i mierzonych.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
              {[
                { num: '01', title: 'Rzemiosło', text: 'Detal, którego nikt nie zauważa, ale każdy czuje.' },
                { num: '02', title: 'Tempo', text: 'Widoczny postęp w 7 dni od kick-offu.' },
                { num: '03', title: 'Jasność', text: 'Wycena bez dopisków drobnym drukiem.' }
              ].map(v => (
                <div key={v.num} className="border border-white/10 rounded-2xl p-5 bg-white/5 group hover:border-pink-1 transition-all">
                  <div className="font-mono text-[11px] text-orange-1 tracking-[0.2em]">/{v.num}</div>
                  <h4 className="font-display mt-2 font-bold uppercase text-xs tracking-widest">{v.title}</h4>
                  <p className="text-[0.8rem] text-zinc-500 mt-2 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* SERVICES */}
        <section id="uslugi" className="min-h-screen px-[6vw] py-[16vh] block">
          <div className="relative">
            <Reveal className="max-w-[360px] lg:absolute lg:top-0">
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em]">[03] ORBITA USŁUG</div>
              <h2 className="font-display font-bold text-[clamp(2rem,3.6vw,3rem)] leading-[0.98] mt-3.5">Cztery stacje wzdłuż pierścienia.</h2>
              <p className="text-zinc-300 text-[0.95rem] leading-relaxed mt-3.5">Każda stacja jest niezależna. Razem tworzą zamknięty cykl — od pomysłu do utrzymania.</p>
            </Reveal>

            <div className="ml-auto w-full md:w-[min(620px,50vw)] flex flex-col gap-[18px] mt-10 lg:mt-0">
              {[
                { 
                  idx: '01', 
                  title: 'Projektowanie produktu', 
                  text: 'Architektura informacji, wireframes, system designu i prototypy. Każdy ekran rozwiązuje konkretny problem użytkownika.',
                  icon: <Globe size={22} />
                },
                { 
                  idx: '02', 
                  title: 'Strony i aplikacje', 
                  text: 'Next.js, Astro, headless CMS. Strony, które ładują się w ułamku sekundy i nie kruszą się pod ruchem.',
                  icon: <Code2 size={22} />
                },
                { 
                  idx: '03', 
                  title: 'SEO i Performance', 
                  text: 'Audyt techniczny, struktura treści, optymalizacja wydajności. Cel: zielone metryki i wysokie pozycje.',
                  icon: <LineChart size={22} />
                },
                { 
                  idx: '04', 
                  title: 'Opieka techniczna', 
                  text: 'Monitoring 24/7, kopie zapasowe, aktualizacje, drobne zmiany. Strona działa, a Ty śpisz spokojnie.',
                  icon: <ShieldCheck size={22} />
                }
              ].map(s => (
                <Reveal key={s.idx}>
                  <div className="group relative bento-card transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-1/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-mono text-[11px] text-zinc-300 tracking-[0.3em] group-hover:text-pink-1 transition-colors">/{s.idx} — SERVICE</span>
                      <div className="w-[44px] h-[44px] rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all">
                        {s.icon}
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white relative z-10">{s.title}</h3>
                    <p className="text-zinc-200 text-[1rem] leading-relaxed max-w-[42ch] mt-4 relative z-10 group-hover:text-white transition-colors">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS SECTION - INSPIRED BY GROWNIDEAS */}
        <section id="proces" className="min-h-screen px-[6vw] py-[16vh] bg-zinc-950/30">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-20 text-center">
              <div className="font-mono text-[11px] text-orange-1 tracking-[0.3em] uppercase">[ Nasza Metodologia ]</div>
              <h2 className="font-display font-bold text-[clamp(2.5rem,5vw,5rem)] leading-none mt-4">Droga od pomysłu <br/> do <span className="text-pink-1">skalowalnego wzrostu.</span></h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Analiza & Strategia', desc: 'Rozumiemy Twój biznes i cele. Definiujemy KPI i ścieżkę użytkownika.' },
                { step: '02', title: 'Prototypowanie', desc: 'Szybkie iteracje designu. Zobacz i poczuj swój produkt w 7 dni.' },
                { step: '03', title: 'Engineering', desc: 'Ręcznie pisany kod, czysta architektura i najwyższa wydajność.' },
                { step: '04', title: 'Wdrożenie & Skalowanie', desc: 'Monitoring wyników i ciągła optymalizacja dla maksymalnych zysków.' }
              ].map((p, idx) => (
                <Reveal key={idx} className="bento-card flex flex-col items-start gap-6 border-white/10 bg-zinc-900/40 group">
                  <div className="text-4xl font-display font-black text-pink-1/20 group-hover:text-pink-1/40 transition-colors uppercase select-none">{p.step}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-zinc-200 leading-relaxed group-hover:text-white transition-colors">{p.desc}</p>
                </Reveal>
              ))}
            </div>
            
            <Reveal className="mt-20 flex justify-center">
              <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col md:flex-row items-center gap-12">
                 <div className="flex flex-col items-center">
                    <span className="text-5xl font-display font-bold text-pink-1">98%</span>
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mt-2">Zadowolenia Klientów</span>
                 </div>
                 <div className="w-px h-12 bg-white/10 hidden md:block" />
                 <div className="flex flex-col items-center">
                    <span className="text-5xl font-display font-bold text-pink-1">150+</span>
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mt-2">Zrealizowanych Orbit</span>
                 </div>
                 <div className="w-px h-12 bg-white/10 hidden md:block" />
                 <div className="flex flex-col items-center">
                    <span className="text-5xl font-display font-bold text-pink-1">24h</span>
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mt-2">Czas Reakcji</span>
                 </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-[6vw] py-[22vh] relative overflow-hidden bg-black/40">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.4em] mb-4 uppercase font-bold">Więcej niż agencja</div>
              <h2 className="font-display font-bold text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[0.9] tracking-tighter mb-12 text-white">
                Skupiamy się na <span className="text-glow-pink">Wynikach</span>, nie tylko na kodzie.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Inteligentna Automatyzacja', desc: 'Eliminujemy powtarzalne prace ręczne. Tworzymy narzędzia, które pracują dla Ciebie 24/7.' },
                  { title: 'Partnerstwo Biznesowe', desc: 'Twoje cele są naszymi celami. Jeśli Ty wygrywasz, my wygrywamy razem z Tobą.' },
                  { title: 'Innowacyjne Rozwiązania', desc: 'Wykorzystujemy najnowsze technologie (AI, Cloud Native), aby dać Ci przewagę nad konkurencją.' }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 group hover:border-pink-1 hover:bg-white/[0.06] transition-all text-left h-full">
                    <h4 className="text-xl font-bold mb-3 group-hover:text-pink-1 transition-colors text-white">{item.title}</h4>
                    <p className="text-zinc-100 leading-relaxed text-sm group-hover:text-white transition-colors">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
        <section id="opinie" className="min-h-screen px-[6vw] py-[12vh] block">
          <div className="max-w-[1200px] mx-auto w-full">
            <Reveal className="mb-9">
              <div className="font-mono text-[11px] text-pink-1 tracking-[0.2em]">[04] SYGNAŁY Z RYNKU</div>
              <h2 className="font-display font-bold text-[clamp(2rem,4vw,3.2rem)] leading-[0.98] mt-3.5">Co mówią ci, którzy nam zaufali.</h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              {[
                { 
                  name: 'Marta Kuznetsova', 
                  role: 'CEO · Northwind Labs', 
                  quote: '„Cosmo Bloom to nie tylko studio, to partnerzy, którzy przenieśli nasz design na wyższy poziom. Konwersja wzrosła o 240%.”' 
                },
                { 
                  name: 'Piotr Janczak', 
                  role: 'CTO · Aurelia Capital', 
                  quote: '„Dbałość o detale i jakość kodu na poziomie, którego nie spotkałem wcześniej u żadnej agencji zewnętrznej.”' 
                }
              ].map((q, i) => (
                <Reveal key={i}>
                  <div className="bg-white/5 border border-white/10 rounded-[18px] p-8 backdrop-blur-lg shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
                    <p className="text-white leading-relaxed text-[1.1rem] italic mb-6">"{q.quote}"</p>
                    <div className="flex flex-col">
                      <div className="font-display text-[1rem] font-bold text-pink-1">{q.name}</div>
                      <div className="font-mono text-[10px] text-zinc-500 tracking-[0.1em] uppercase">{q.role}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="min-h-screen px-[6vw] py-[12vh] block">
          <Reveal className="max-w-[800px] mx-auto w-full">
            <div className="font-mono text-[11px] text-orange-1 tracking-[0.2em]">[05] CZĘSTE PYTANIA</div>
            <h2 className="font-display font-bold text-[clamp(2rem,4vw,3.2rem)] leading-[0.98] mt-3.5 mb-10">Wiedza.</h2>
            
            <div className="flex flex-col">
              <FAQItem 
                question="Ile kosztuje realizacja projektu?"
                answer="Każdy projekt wyceniamy indywidualnie po analizie Twoich potrzeb. Stosujemy model Fixed Price, co oznacza, że cena nie zmieni się w trakcie trwania prac."
              />
              <FAQItem 
                question="Czy otrzymam wsparcie po uruchomieniu strony?"
                answer="Tak. Każdy projekt obejmuje 3 miesiące bezpłatnej opieki technicznej. Oferujemy również długoterminowe pakiety utrzymaniowe, aby Twoja strona zawsze była bezpieczna i aktualna."
              />
              <FAQItem 
                question="Czy strona będzie poprawnie wyświetlać się na telefonach?"
                answer="Bezwzględnie. Projektujemy w podejściu Mobile-First. Twoja strona będzie zoptymalizowana pod kątem szybkości i wygody użytkowania na każdym urządzeniu."
              />
              <FAQItem 
                question="Jak wygląda proces współpracy?"
                answer="Zaczynamy od warsztatu strategicznego, następnie tworzymy prototypy, design i finalny kod. Całość odbywa się w przejrzystych tygodniowych cyklach (sprintach)."
              />
            </div>
          </Reveal>
        </section>

        {/* CONTACT */}
        <section id="kontakt" className="min-h-screen px-[6vw] py-[12vh] flex items-center justify-center">
          <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-none">
                Gotowy na <br/> <span className="text-pink-1">Wielki Skok?</span>
              </h2>
              <p className="text-zinc-500 text-xl leading-relaxed mb-12">
                Niezależnie od tego, czy masz gotowy brief, czy tylko luźny pomysł – napisz do nas. Przeanalizujemy Twoje potrzeby i wrócimy z konkretami w 24h.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-pink-1">
                    <Mail size={22} />
                  </div>
                  <span className="text-xl font-medium">kontakt@cosmobloom.studio</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-pink-1">
                    <Phone size={22} />
                  </div>
                  <span className="text-xl font-medium">+48 22 305 81 04</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-[40px] backdrop-blur-2xl">
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Imię i Nazwisko</label>
                  <input required className="bg-transparent border-b border-white/20 py-3 outline-none focus:border-pink-1 transition-colors text-white" placeholder="Jan Kowalski" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Email</label>
                  <input required type="email" className="bg-transparent border-b border-white/20 py-3 outline-none focus:border-pink-1 transition-colors text-white" placeholder="ty@firma.pl" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Opisz swój projekt</label>
                  <textarea required className="bg-transparent border-b border-white/20 py-3 outline-none focus:border-pink-1 transition-colors min-h-[100px] text-white" placeholder="Strona webowa, termin marzec..." />
                </div>
                <button type="submit" className="w-full bg-pink-1 text-white py-5 rounded-full font-bold uppercase tracking-widest hover:bg-[#ff1a8c] hover:shadow-[0_0_40px_rgba(255,0,127,0.6)] transition-all transform hover:-translate-y-1">
                  {formStatus || 'WYŚLIJ SYGNAŁ'}
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="px-[6vw] py-16 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="font-display font-bold text-xl tracking-tighter text-white">COSMO BLOOM © 2026</div>
          <nav className="flex gap-8 font-mono text-[10px] tracking-widest text-zinc-600">
            <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
            <a href="#" className="hover:text-white transition-colors">DRIBBBLE</a>
            <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
          </nav>
          <div className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.4em]">BUILT IN THE COSMOS · WARSAW</div>
        </div>
      </footer>
    </div>
  );
}
