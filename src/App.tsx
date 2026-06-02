import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import VigilanceHUD from './components/VigilanceHUD';
import DavinaLogo from './components/DavinaLogo';
import { Cpu, Crosshair, Rocket, Globe, ShieldCheck, Navigation, Lock, Mail, Phone, MapPin } from 'lucide-react';

type MissionItem = {
  letter: string;
  title: string;
  icon: ReactNode;
  desc: string;
  status: string;
  available: boolean;
};

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [activeAcronym, setActiveAcronym] = useState('Defence');
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setHasScrolled(scrollTop > 48);
    };
    const watchScroll = () => {
      onScroll();
      frame = window.requestAnimationFrame(watchScroll);
    };
    onScroll();
    frame = window.requestAnimationFrame(watchScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const acronyms: MissionItem[] = [
    {
      letter: 'D',
      title: 'Defence',
      icon: <ShieldCheck />,
      desc: 'Advanced defence aerospace systems for national security, strategic readiness, surveillance, rapid response, and long-range operational capability.',
      status: 'Open',
      available: true,
    },
    {
      letter: 'A',
      title: 'Avionics',
      icon: <Cpu />,
      desc: 'Flight control systems, mission computers, communication networks, cockpit technologies, and integrated electronic architectures for safer missions.',
      status: 'Open',
      available: true,
    },
    {
      letter: 'V',
      title: 'Vigilance',
      icon: <Crosshair />,
      desc: 'Monitoring systems, airborne surveillance platforms, sensor fusion, and intelligence-gathering tools for continuous situational awareness.',
      status: 'In progress',
      available: false,
    },
    {
      letter: 'I',
      title: 'Intelligence',
      icon: <Globe />,
      desc: 'Artificial intelligence, autonomous decision-making, predictive analytics, and adaptive mission technologies for smarter aerospace platforms.',
      status: 'In progress',
      available: false,
    },
    {
      letter: 'N',
      title: 'Navigation',
      icon: <Navigation />,
      desc: 'Resilient guidance systems, autonomous route optimization, high-accuracy positioning, and reliable operation in complex environments.',
      status: 'In progress',
      available: false,
    },
    {
      letter: 'A',
      title: 'Advancement',
      icon: <Rocket />,
      desc: 'Research, engineering excellence, advanced manufacturing, and bold innovation for the next era of flight, defence, and space exploration.',
      status: 'In progress',
      available: false,
    },
  ];

  const detailMap: Record<string, { title: string; body: string; tag: string }> = {
    Defence: {
      title: 'Defence Systems',
      tag: 'Operational Layer',
      body: 'Davina Aerospace is committed to developing advanced defence aerospace systems that enhance national security, strengthen strategic readiness, and support trusted allied nations with reliable next-generation air and space technologies.',
    },
    Avionics: {
      title: 'Avionics Intelligence',
      tag: 'Core Stack',
      body: 'Davina Aerospace advances the intelligence core of aerospace platforms through flight control systems, mission computers, communication networks, cockpit technologies, and integrated electronic architectures built for precision, reliability, and mission efficiency.',
    },
  };

  const team = [
    {
      name: 'A. Rajeshkanna',
      role: 'CEO',
      title: 'Chief Executive Officer',
      desc: 'Leads Davina Aerospace’s vision, strategy, partnerships, investments, and long-term direction.',
    },
    {
      name: 'Koshik Goswami',
      role: 'COO',
      title: 'Chief Operations Officer',
      desc: 'Manages daily operations, project execution, manufacturing coordination, and company workflow.',
    },
    {
      name: 'Ashriith',
      role: 'CTO',
      title: 'Chief Technology Officer',
      desc: 'Heads research, engineering, aircraft systems, avionics, autonomous platforms, propulsion, and AI integration.',
    },
    {
      name: 'Siddiq',
      role: 'CDO',
      title: 'Chief Design Officer',
      desc: 'Leads aircraft architecture, aerodynamics, structures, cockpit interfaces, product aesthetics, and future platform design.',
    },
    {
      name: 'Taran',
      role: 'Business Consultant',
      title: 'Strategic Business Consultant',
      desc: 'Guides growth, market positioning, funding opportunities, commercial planning, and scalable business strategy.',
    },
  ];

  const handleMissionClick = (item: MissionItem) => {
    setActiveAcronym(item.title);
    if (item.available) {
      setActivePage(item.title);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent text-white font-sans overflow-x-hidden selection:bg-cyan-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-40">
        <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_14%,rgba(6,182,212,0.16),transparent_45%)]" />
      <div className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_68%,rgba(8,47,73,0.28),transparent_55%)]" />

      <Scene routeActive={false} routeDefinition={{ originLabel: '', origin: { lat: 0, lon: 0 }, destLabel: '', dest: { lat: 0, lon: 0 } }} />
      <VigilanceHUD />
      <Navbar showLogo={hasScrolled} />

      <AnimatePresence>
        {isBooting && (
          <motion.div
            exit={{ opacity: 0, filter: 'blur(40px)' }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-mono"
          >
            <div className="text-cyan-500 text-[10px] tracking-[3em] mb-4 uppercase italic">Avionics_Systems_Online</div>
            <div className="w-96 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full">
        <section id="home" className="h-screen flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hasScrolled ? 0 : 1, y: hasScrolled ? -36 : 0, scale: hasScrolled ? 0.92 : 1 }}
            transition={{ delay: hasScrolled ? 0 : 2.2, duration: hasScrolled ? 0.18 : 0.35 }}
            className="flex flex-col items-center text-center mt-[-18vh] relative z-20"
          >
            <div className="w-full max-w-5xl mx-auto drop-shadow-[0_0_90px_rgba(34,211,238,0.3)]">
              <DavinaLogo variant="hero" />
            </div>

            <div className="flex flex-col items-center gap-6 mt-8 max-w-5xl px-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-cyan-500/50" />
                <p className="text-cyan-300 font-mono tracking-[0.55em] text-base md:text-[1.6rem] uppercase font-black">
                  Advancing Defence. Expanding Space.
                </p>
                <div className="h-[1px] w-12 bg-cyan-500/50" />
              </div>
              <p className="max-w-3xl text-sm font-medium leading-relaxed tracking-[0.08em] text-slate-200/95 md:text-lg">
                Building intelligent defence systems, agile aerial vehicles, and reusable space platforms that expand human capability on Earth and beyond.
              </p>            </div>
          </motion.div>
        </section>

        <section id="mission" className="min-h-screen py-32 px-6 md:px-20 bg-gradient-to-b from-transparent via-[#000103]/80 to-[#000103] backdrop-blur-sm border-t border-cyan-500/10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 flex flex-col items-center text-center">
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4">D.A.V.I.N.A Mission</span>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Engineering Intelligent<br /><span className="text-cyan-500">Aerospace Systems</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {acronyms.map((item, idx) => (
                <button
                  key={`${item.title}-${idx}`}
                  onClick={() => handleMissionClick(item)}
                  className={`text-left p-8 border border-white/10 bg-white/[0.045] hover:bg-cyan-900/15 hover:border-cyan-500/35 transition-all rounded-xl group relative overflow-hidden backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_rgba(0,0,0,0.22)] ${activeAcronym === item.title ? 'border-cyan-500/60 bg-cyan-900/20' : ''}`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic font-mono group-hover:text-cyan-500 group-hover:opacity-10 transition-all">{item.letter}</div>
                  {!item.available && <Lock size={18} className="absolute top-7 right-7 text-cyan-300/80" />}
                  <div className="text-cyan-500 mb-6 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all transform origin-left">{item.icon}</div>
                  <h3 className="text-2xl font-bold tracking-widest uppercase mb-4">
                    <span className="text-cyan-500">{item.letter}</span>{item.title.substring(1)}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">{item.desc}</p>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-cyan-300">
                    <span>{item.status}</span>
                    {!item.available && <span>Locked</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-32 px-6 md:px-20 bg-[#000103] border-t border-white/5">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.4fr] gap-14 items-start">
            <div>
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 block">About</span>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Built In India.<br />Designed For The Future.</h2>
            </div>
            <div className="text-slate-300 text-base md:text-lg leading-8 space-y-6">
              <p>
                Davina Aerospace is an Indian-based private aerospace company built on one idea: push beyond limits. We design advanced aircraft, autonomous systems, defence technologies, and next-generation space platforms made for the future.
              </p>
              <p>
                By combining engineering, innovation, and bold thinking, our mission is to build powerful aerospace systems that redefine flight, strengthen strategic partnerships with allied nations, and expand humanity’s reach beyond Earth.
              </p>
              <p>
                With a vision for global operations, Davina Aerospace aims to deliver world-class aerospace and defence solutions from India to the international stage.
              </p>
            </div>
          </div>
        </section>

        <section id="teams" className="py-32 px-6 md:px-20 bg-[#000103] border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 block">Teams</span>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Leadership</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              {team.map((person) => (
                <article key={person.name} className="rounded-xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_rgba(0,0,0,0.18)]">
                  <div className="mb-6 h-20 w-20 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-200 font-black text-2xl">
                    {person.name.charAt(0)}
                  </div>
                  <p className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-3">{person.role}</p>
                  <h3 className="text-xl font-black uppercase tracking-wide">{person.name}</h3>
                  <p className="text-slate-300 text-sm mt-2">{person.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mt-5">{person.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="fund" className="py-32 px-6 md:px-20 bg-[#000103] border-t border-white/5">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 block">Fund</span>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Fuel The Next Flight</h2>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-white/[0.045] p-8 backdrop-blur-xl">
              <p className="text-slate-300 text-lg leading-8">
                Davina Aerospace welcomes strategic supporters, partners, and investors who want to help accelerate research, prototyping, manufacturing readiness, and global aerospace growth from India.
              </p>
              <a href="#contact" className="mt-8 inline-flex border border-cyan-500/40 bg-cyan-500/10 px-8 py-3 text-xs tracking-[0.3em] font-mono uppercase hover:bg-cyan-500/20 transition-colors">
                Contact For Funding
              </a>
            </div>
          </div>
        </section>

        <section id="contact" className="py-32 px-6 md:px-20 bg-[#000103] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 block">Contact Us</span>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-12">Start A Strategic Conversation</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Mail size={22} />, label: 'Email', value: 'contact@davinaaerospace.com' },
                { icon: <Phone size={22} />, label: 'Phone', value: 'Available on request' },
                { icon: <MapPin size={22} />, label: 'Base', value: 'India' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
                  <div className="text-cyan-400 mb-5">{item.icon}</div>
                  <p className="text-cyan-300 text-[10px] uppercase tracking-[0.35em] mb-3">{item.label}</p>
                  <p className="text-slate-200 text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-20 text-center bg-[#000103] border-t border-white/5">
          <p className="text-slate-600 font-mono text-[10px] tracking-[0.5em] uppercase">© 2026 DAVINA Aerospace</p>
        </footer>
      </main>

      <AnimatePresence>
        {activePage && detailMap[activePage] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#01040a]/96 backdrop-blur-xl p-8 md:p-16">
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
              <span className="text-cyan-400 font-mono text-[11px] tracking-[0.8em] uppercase">{detailMap[activePage].tag}</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mt-4">{detailMap[activePage].title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed mt-8 max-w-3xl">{detailMap[activePage].body}</p>
              <button onClick={() => setActivePage(null)} className="mt-10 w-fit border border-cyan-500/40 bg-cyan-500/10 px-8 py-3 text-xs tracking-[0.3em] font-mono uppercase hover:bg-cyan-500/20 transition-colors pointer-events-auto">Return</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
