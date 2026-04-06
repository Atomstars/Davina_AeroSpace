import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import VigilanceHUD from './components/VigilanceHUD';
import DavinaLogo from './components/DavinaLogo';
import { Target, Zap, Cpu, Crosshair, Rocket, Globe, ShieldCheck, Navigation } from 'lucide-react';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [activeAcronym, setActiveAcronym] = useState('Defence');
  const [navOpen, setNavOpen] = useState(false);
  const [routeActive, setRouteActive] = useState(false);
  const [routeDefinition, setRouteDefinition] = useState({
    originLabel: 'New Delhi, India',
    origin: { lat: 20, lon: 78 },
    destLabel: 'Perth, Australia',
    dest: { lat: -25, lon: 133 },
  });
  const [routeInputs, setRouteInputs] = useState({
    originLabel: 'New Delhi, India',
    originLat: '20',
    originLon: '78',
    destLabel: 'Perth, Australia',
    destLat: '-25',
    destLon: '133',
  });
  const [actionStage, setActionStage] = useState<'idle' | 'initiated' | 'scanning' | 'complete'>('idle');
  const [actionMessage, setActionMessage] = useState('Ready to execute mission command.');
  const actionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      actionTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const acronyms = [
    { letter: 'D', title: 'Defence', icon: <ShieldCheck />, desc: 'Advanced systems protecting nations and infrastructure, including aerial defence and disaster response drones.', status: 'Operational', progress: 82, keyMetric: 'Threat detection' },
    { letter: 'A', title: 'Avionics', icon: <Cpu />, desc: 'Intelligent flight computers, sensor fusion systems, and next-generation aerospace electronics.', status: 'Optimized', progress: 75, keyMetric: 'Telemetry integrity' },
    { letter: 'V', title: 'Vigilance', icon: <Crosshair />, desc: 'Advanced aerial platforms, morphing-wing drones, and surveillance UAVs for situational awareness.', status: 'Active', progress: 68, keyMetric: 'Target acquisition' },
    { letter: 'I', title: 'Intelligence', icon: <Target />, desc: 'AI-integrated autonomous mission planning, threat detection, and predictive navigation systems.', status: 'Analyzing', progress: 71, keyMetric: 'Decision confidence' },
    { letter: 'N', title: 'Navigation', icon: <Navigation />, desc: 'GPS-independent telemetry, orbital trajectory control, and precision satellite-assisted flight paths.', status: 'Locked', progress: 88, keyMetric: 'Course stability' },
    { letter: 'A', title: 'Advancement', icon: <Rocket />, desc: 'Pushing the boundaries of high-density aerospace fuel, propulsion, and reusable space vehicles.', status: 'Research', progress: 64, keyMetric: 'Prototype readiness' },
  ];

  const moduleStatus: Record<string, { title: string; tag: string; body: string; badge: string; readout: string; metrics: Array<{ label: string; value: string }>; action: string }> = {
    Defence: { title: 'Defence Systems', tag: 'Operational Layer', body: 'DAVINA defence platforms are designed for rapid response, resilient surveillance, and adaptive mission control under high-pressure environments.', badge: 'ACTIVE', readout: 'Threat level green', metrics: [
      { label: 'Threat detection', value: '98%' },
      { label: 'Shield integrity', value: '93%' },
      { label: 'Response latency', value: '14 ms' },
    ], action: 'Deploy intercept protocol' },
    Avionics: { title: 'Avionics Intelligence', tag: 'Core Stack', body: 'Our avionics stack focuses on reliable sensor fusion, flight telemetry integrity, and low-latency onboard decision support.', badge: 'OPTIMIZED', readout: 'Sensor mesh stable', metrics: [
      { label: 'Telemetry health', value: '91%' },
      { label: 'CPU load', value: '62%' },
      { label: 'Data sync', value: '99.7%' },
    ], action: 'Run systems calibration' },
    Vigilance: { title: 'Vigilance Platforms', tag: 'Aerial Systems', body: 'Vigilance systems combine agile wing architecture with persistent monitoring capabilities for wide-area awareness missions.', badge: 'ENGAGED', readout: 'Target acquisition nominal', metrics: [
      { label: 'Coverage area', value: '74%' },
      { label: 'Sensor sweep', value: '3.2 s' },
      { label: 'Latency', value: '18 ms' },
    ], action: 'Initiate surveillance sweep' },
    Intelligence: { title: 'Mission Intelligence', tag: 'AI Layer', body: 'Autonomous mission orchestration enables faster threat interpretation and cleaner route optimization in contested airspaces.', badge: 'ANALYZING', readout: 'Predictive models online', metrics: [
      { label: 'Inference rate', value: '15 kHz' },
      { label: 'Decision confidence', value: '87%' },
      { label: 'Alert streams', value: '42' },
    ], action: 'Open target forecast' },
    Navigation: { title: 'Navigation Grid', tag: 'Guidance Layer', body: 'Redundant navigation pipelines ensure stable heading control and precision movement, even in degraded GPS conditions.', badge: 'LOCKED', readout: 'Orbital path secured', metrics: [
      { label: 'Course stability', value: '96%' },
      { label: 'Vector lock', value: '5/5' },
      { label: 'Signal strength', value: '88%' },
    ], action: 'Verify trajectory' },
    Advancement: { title: 'Future Advancement', tag: 'R&D Layer', body: 'DAVINA R&D explores propulsion breakthroughs, robust materials, and scalable aerospace infrastructure for future expansion.', badge: 'IN PROGRESS', readout: 'Prototype cycle active', metrics: [
      { label: 'Fuel efficiency', value: '76%' },
      { label: 'Prototype count', value: '8' },
      { label: 'Test readiness', value: '69%' },
    ], action: 'Review research log' },
  };

  const activeControl = moduleStatus[activeAcronym] || moduleStatus.Defence;

  const roadmap = [
    { phase: '01', title: 'Advanced Drone Systems', desc: 'Agile aerial platforms for terrestrial surveillance and response.' },
    { phase: '02', title: 'Defence & Security Tech', desc: 'Securing critical infrastructure against natural and artificial threats.' },
    { phase: '03', title: 'Propulsion & Fuel Research', desc: 'Developing high-density sustainable fuels for extended flight.' },
    { phase: '04', title: 'Reusable Aerospace Vehicles', desc: 'Next-generation craft designed for continuous multi-atmospheric deployment.' },
    { phase: '05', title: 'Orbital Infrastructure', desc: 'Space logistics and permanent extra-terrestrial operational hubs.' },
  ];

  const handleModuleAction = () => {
    setActivePage(activeAcronym);
    if (activeAcronym === 'Navigation') {
      setNavOpen(true);
      setRouteActive(false);
    }
    setActionStage('initiated');
    setActionMessage(`Initiating ${activeAcronym} sweep...`);

    actionTimers.current.forEach((timer) => clearTimeout(timer));
    actionTimers.current = [];

    actionTimers.current.push(
      setTimeout(() => {
        setActionStage('scanning');
        setActionMessage(`${activeAcronym} sweep in progress.`);
      }, 600)
    );

    actionTimers.current.push(
      setTimeout(() => {
        setActionStage('complete');
        setActionMessage(`${activeAcronym} sweep complete. Data locked.`);
      }, 1800)
    );

    actionTimers.current.push(
      setTimeout(() => {
        setActionStage('idle');
        setActionMessage('Ready to execute mission command.');
      }, 3200)
    );
  };

  const detailMap: Record<string, { title: string; body: string; tag: string }> = {
    Defence: { title: "Defence Systems", tag: "Operational Layer", body: "DAVINA defence platforms are designed for rapid response, resilient surveillance, and adaptive mission control under high-pressure environments." },
    Avionics: { title: "Avionics Intelligence", tag: "Core Stack", body: "Our avionics stack focuses on reliable sensor fusion, flight telemetry integrity, and low-latency onboard decision support." },
    Vigilance: { title: "Vigilance Platforms", tag: "Aerial Systems", body: "Vigilance systems combine agile wing architecture with persistent monitoring capabilities for wide-area awareness missions." },
    Intelligence: { title: "Mission Intelligence", tag: "AI Layer", body: "Autonomous mission orchestration enables faster threat interpretation and cleaner route optimization in contested airspaces." },
    Navigation: { title: "Navigation Grid", tag: "Guidance Layer", body: "Redundant navigation pipelines ensure stable heading control and precision movement, even in degraded GPS conditions." },
    Advancement: { title: "Future Advancement", tag: "R&D Layer", body: "DAVINA R&D explores propulsion breakthroughs, robust materials, and scalable aerospace infrastructure for future expansion." },
    "Advanced Drone Systems": { title: "Phase 01 - Drone Systems", tag: "Roadmap", body: "Phase 01 establishes modular drone operations, endurance testing, and mission deployment protocols." },
    "Defence & Security Tech": { title: "Phase 02 - Defence Tech", tag: "Roadmap", body: "Phase 02 focuses on defence-grade integration for perimeter security and strategic response readiness." },
    "Propulsion & Fuel Research": { title: "Phase 03 - Propulsion Research", tag: "Roadmap", body: "Phase 03 advances fuel efficiency and propulsion dynamics for extended range and rapid maneuvering." },
    "Reusable Aerospace Vehicles": { title: "Phase 04 - Aerospace Vehicles", tag: "Roadmap", body: "Phase 04 moves into reusable craft design for sustainable multi-mission aerospace operations." },
    "Orbital Infrastructure": { title: "Phase 05 - Orbital Infrastructure", tag: "Roadmap", body: "Phase 05 introduces orbital service architecture for long-term inter-atmospheric logistics." }
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent text-white font-sans cursor-none overflow-x-hidden selection:bg-cyan-500/30">

      {/* Tactical Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-40">
        <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_14%,rgba(6,182,212,0.16),transparent_45%)]" />
      <div className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_68%,rgba(8,47,73,0.28),transparent_55%)]" />

      <Scene routeActive={routeActive} routeDefinition={routeDefinition} />
      <VigilanceHUD
        navOpen={navOpen}
        routeActive={routeActive}
        onNavClick={() => {
          setNavOpen(true);
          setRouteActive(false);
          setActivePage('Navigation');
        }}
        onLocate={() => {
          setNavOpen(true);
          setRouteActive(true);
          setActivePage('Navigation');
        }}
        onClose={() => {
          setRouteActive(false);
          setNavOpen(false);
        }}
        onSubmitRoute={() => {
          const originLat = Number(routeInputs.originLat);
          const originLon = Number(routeInputs.originLon);
          const destLat = Number(routeInputs.destLat);
          const destLon = Number(routeInputs.destLon);

          if (
            Number.isFinite(originLat) &&
            Number.isFinite(originLon) &&
            Number.isFinite(destLat) &&
            Number.isFinite(destLon)
          ) {
            setRouteDefinition({
              originLabel: routeInputs.originLabel || 'Origin',
              origin: { lat: originLat, lon: originLon },
              destLabel: routeInputs.destLabel || 'Destination',
              dest: { lat: destLat, lon: destLon },
            });
            setNavOpen(true);
            setRouteActive(true);
            setActivePage('Navigation');
          }
        }}
        routeInputs={routeInputs}
        setRouteInputs={setRouteInputs}
      />
      <Navbar />

      <AnimatePresence>
        {isBooting && (
          <motion.div
            exit={{ opacity: 0, filter: "blur(40px)" }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-mono"
          >
            <div className="text-cyan-500 text-[10px] tracking-[3em] mb-4 uppercase italic">Avionics_Systems_Online</div>
            <div className="w-96 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div
                initial={{ left: "-100%" }} animate={{ left: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="h-screen flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 1 }}
            // FIX IS HERE: Changed mt-[-6vh] to mt-[-22vh] to pull everything up!
            className="flex flex-col items-center text-center mt-[-22vh] relative z-20"
          >
            <div className="flex items-center gap-8 mb-8 opacity-60">
              <Globe size={14} className="text-cyan-500" />
              <span className="text-[10px] font-mono tracking-[1.5em] uppercase italic text-cyan-50">Global_Aerospace_Command</span>
              <Globe size={14} className="text-cyan-500" />
            </div>

            <div className="w-full max-w-5xl mx-auto drop-shadow-[0_0_90px_rgba(34,211,238,0.3)]">
              <DavinaLogo variant="hero" />
            </div>

            <div className="flex flex-col items-center gap-6 mt-10 max-w-4xl px-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-cyan-500/50" />
                <p className="text-cyan-400 font-mono tracking-[1.2em] text-[9px] md:text-xs uppercase font-black pl-4 opacity-90">
                  Advancing Defence. Expanding Space.
                </p>
                <div className="h-[1px] w-12 bg-cyan-500/50" />
              </div>

              <p className="text-slate-300 text-sm md:text-lg font-light italic mt-4 opacity-80 leading-relaxed max-w-2xl">
                Building intelligent defence systems, agile aerial vehicles, and reusable space platforms that expand human capability on Earth and beyond.
              </p>

              <div className="flex items-center gap-3 opacity-80 mt-8 border border-cyan-500/30 px-8 py-3 rounded-full bg-cyan-950/20 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)] pointer-events-auto cursor-pointer hover:bg-cyan-500/10 transition-colors">
                <Zap size={14} className="text-yellow-400 animate-pulse" />
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-cyan-50">Initiate click for Propulsion Diagnostics</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ACRONYM PHILOSOPHY SECTION */}
        <section className="min-h-screen py-32 px-10 md:px-20 bg-gradient-to-b from-transparent via-[#000103]/80 to-[#000103] backdrop-blur-sm border-t border-cyan-500/10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 flex flex-col items-center text-center">
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4">Core Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Engineering Intelligent<br /><span className="text-cyan-500">Aerospace Systems</span></h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {acronyms.map((item, idx) => (
                  <button key={idx} onClick={() => { setActiveAcronym(item.title); setActivePage(item.title); }} className={`text-left p-8 border border-white/5 bg-white/[0.02] hover:bg-cyan-900/10 hover:border-cyan-500/30 transition-all rounded-2xl group relative overflow-hidden cursor-pointer ${activeAcronym === item.title ? 'border-cyan-500/60 bg-cyan-900/20' : ''}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic font-mono group-hover:text-cyan-500 group-hover:opacity-10 transition-all">{item.letter}</div>
                    <div className="text-cyan-500 mb-6 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all transform origin-left">{item.icon}</div>
                    <h3 className="text-2xl font-bold tracking-widest uppercase mb-4 flex items-center gap-3"><span className="text-cyan-500">{item.letter}</span> {item.title.substring(1)}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-light mb-6">{item.desc}</p>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-cyan-300 mb-4">
                      <span>{item.status}</span>
                      <span>{item.keyMetric}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: `${item.progress}%` }} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden xl:block rounded-3xl border border-white/5 bg-[#01040a]/90 p-8 shadow-[0_0_60px_rgba(6,182,212,0.08)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-cyan-300 mb-8">
                  <span>Mission Control</span>
                  <span className="text-white/80">Live Module Feed</span>
                </div>
                <div className="rounded-3xl border border-cyan-500/10 bg-black/20 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-cyan-400 text-[10px] uppercase tracking-[0.4em] mb-2">{activeControl.tag}</p>
                      <h3 className="text-2xl font-black tracking-tight leading-tight">{activeControl.title}</h3>
                    </div>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-cyan-200">{activeControl.badge}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{activeControl.body}</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 mb-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                    <span>Command Status</span>
                    <span className="text-cyan-300">{actionStage === 'idle' ? 'STANDBY' : actionStage.toUpperCase()}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{actionMessage}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Mission Readout</span>
                    <span className="text-cyan-300">{activeControl.readout}</span>
                  </div>
                  {activeControl.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-sm text-slate-200 mb-2">
                        <span>{metric.label}</span>
                        <span className="text-cyan-300">{metric.value}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-500" style={{ width: metric.value.includes('%') ? metric.value : '70%' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleModuleAction}
                  className="w-full py-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-sm uppercase tracking-[0.3em] text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                >
                  {activeControl.action}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ROADMAP SECTION */}
        <section className="py-32 px-10 md:px-20 bg-[#000103] border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="mb-20">
              <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 block">Technology Roadmap</span>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">The Future of <br />Aerospace Mobility</h2>
            </div>
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyan-500/30 before:to-transparent">
              {roadmap.map((item, idx) => (
                <button key={idx} onClick={() => setActivePage(item.title)} className="relative w-full text-left flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-500/50 bg-[#000103] text-cyan-500 font-mono text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(6,182,212,0.2)] z-10">{item.phase}</div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-white/5 bg-white/[0.02] group-hover:border-cyan-500/30 transition-all">
                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2 text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm font-light">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-20 text-center bg-[#000103] border-t border-white/5">
          <p className="text-slate-600 font-mono text-[10px] tracking-[0.5em] uppercase">© 2026 DAVINA Aerospace // Restricted Access</p>
        </footer>
      </main>

      <AnimatePresence>
        {activePage && detailMap[activePage] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#01040a]/96 backdrop-blur-xl p-8 md:p-16">
            <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
              <span className="text-cyan-400 font-mono text-[11px] tracking-[0.8em] uppercase">{detailMap[activePage].tag}</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mt-4">{detailMap[activePage].title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed mt-8 max-w-3xl">{detailMap[activePage].body}</p>
              <button onClick={() => setActivePage(null)} className="mt-10 w-fit border border-cyan-500/40 bg-cyan-500/10 px-8 py-3 text-xs tracking-[0.3em] font-mono uppercase hover:bg-cyan-500/20 transition-colors pointer-events-auto">Return to Command</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}