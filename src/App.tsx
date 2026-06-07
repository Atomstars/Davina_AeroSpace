import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import AerospaceCursor from './components/AerospaceCursor';
import VigilanceHUD from './components/VigilanceHUD';
import DavinaLogo from './components/DavinaLogo';
import { useSmoothScroll } from './lib/scroll';
import {
    Cpu, Crosshair, Rocket, Globe, ShieldCheck, Navigation,
    Mail, MapPin, ArrowUpRight, ChevronDown, Send,
    Radar, Zap, Target, Users, Handshake, TrendingUp,
    Linkedin, Twitter, Github,
} from 'lucide-react';

// ── TYPES ───────────────────────────────────────────────
type AcronymItem = {
    letter: string;
    title: string;
    icon: React.ReactNode;
    mission: string;
    desc: string;
    tech: string[];
    applications: string[];
    phase: string;
    phaseNum: number;
};

type TeamMember = {
    name: string;
    initials: string;
    role: string;
    title: string;
    desc: string;
    domains: string[];
};

// ── SECTION WRAPPER ─────────────────────────────────────
function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) el.querySelectorAll('.reveal').forEach(r => r.classList.add('visible')); },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <section ref={ref} id={id} className={className}>
            {children}
        </section>
    );
}

// ── LABEL COMPONENT ─────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="label-mono block mb-5">
            {children}
        </span>
    );
}

// ── STAT CARD ────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="card-glass px-6 py-5 text-center">
            <p className="font-display text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {value}
            </p>
            <p className="label-mono text-slate-400">{label}</p>
        </div>
    );
}

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
    const [isBooting, setIsBooting] = useState(true);
    const [activeAcronym, setActiveAcronym] = useState('Defence');
    const [formState, setFormState] = useState({ name: '', org: '', message: '', sent: false });

    // Premium smooth scrolling — drives the cinematic 3D camera choreography.
    useSmoothScroll();

    // Preloader bound to real asset loading (Earth textures, etc.).
    const { active, progress } = useProgress();
    const [minTimeDone, setMinTimeDone] = useState(false);

    // Top-of-page scroll progress indicator.
    const { scrollYProgress } = useScroll();
    const scrollScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

    // Minimum on-screen time so the preloader never just flashes.
    useEffect(() => {
        const t = setTimeout(() => setMinTimeDone(true), 1400);
        return () => clearTimeout(t);
    }, []);

    // Dismiss once assets are loaded AND the minimum time has elapsed.
    useEffect(() => {
        if (minTimeDone && progress >= 100 && !active) setIsBooting(false);
    }, [minTimeDone, progress, active]);

    // Safety fallback — never trap the user behind the preloader.
    useEffect(() => {
        const t = setTimeout(() => setIsBooting(false), 7000);
        return () => clearTimeout(t);
    }, []);

    // ── DATA ──────────────────────────────────────────────

    const acronyms: AcronymItem[] = [
        {
            letter: 'D', title: 'Defence', icon: <ShieldCheck size={20} />,
            mission: 'Securing the skies. Protecting allied nations.',
            desc: 'Advanced defence aerospace systems for national security, strategic readiness, and reliable allied-nation support — built to operate at the limits of operational demand.',
            tech: ['Unmanned Combat Aerial Vehicles', 'Hardened Command Systems', 'Counter-UAS Platforms'],
            applications: ['Border Surveillance', 'Rapid Response', 'Strategic Strike'],
            phase: 'Active Development', phaseNum: 1,
        },
        {
            letter: 'A', title: 'Avionics', icon: <Cpu size={20} />,
            mission: 'The intelligence core of every aerospace platform.',
            desc: 'Flight control systems, mission computers, communication architectures, and integrated electronic systems engineered for precision and mission reliability.',
            tech: ['Flight Control Units', 'Mission Data Processors', 'Secure Comms Arrays'],
            applications: ['Cockpit Integration', 'Sensor Fusion', 'Fault-Tolerant Systems'],
            phase: 'Active Development', phaseNum: 1,
        },
        {
            letter: 'V', title: 'Vigilance', icon: <Crosshair size={20} />,
            mission: 'Eyes on every horizon. Always.',
            desc: 'Airborne surveillance platforms, sensor fusion networks, and intelligence-gathering architectures for persistent, wide-area situational awareness.',
            tech: ['Multi-Spectral Sensors', 'Real-Time Data Relay', 'Target Classification AI'],
            applications: ['ISR Missions', 'Maritime Patrol', 'Infrastructure Monitoring'],
            phase: 'Research Phase', phaseNum: 2,
        },
        {
            letter: 'I', title: 'Intelligence', icon: <Globe size={20} />,
            mission: 'Machines that learn. Platforms that adapt.',
            desc: 'Artificial intelligence, autonomous decision-making, predictive mission analytics, and adaptive flight systems for smarter, faster aerospace operations.',
            tech: ['Onboard Neural Networks', 'Adaptive Mission Planning', 'Threat Prediction Models'],
            applications: ['Autonomous Operations', 'Combat Intelligence', 'Fleet Coordination'],
            phase: 'Research Phase', phaseNum: 2,
        },
        {
            letter: 'N', title: 'Navigation', icon: <Navigation size={20} />,
            mission: 'Precision routing in any environment, anywhere.',
            desc: 'Resilient guidance systems, autonomous route optimization, and high-accuracy positioning that operates reliably even in GPS-denied or contested environments.',
            tech: ['INS/GNSS Fusion', 'Terrain-Referenced Nav', 'Swarm Coordination Protocols'],
            applications: ['GPS-Denied Ops', 'Precision Delivery', 'Hostile Airspace Transit'],
            phase: 'Research Phase', phaseNum: 2,
        },
        {
            letter: 'A', title: 'Advancement', icon: <Rocket size={20} />,
            mission: 'Engineering excellence for the next generation of flight.',
            desc: 'Research, bold experimentation, advanced manufacturing, and breakthrough innovation that defines Davina\'s roadmap for the future of aerospace.',
            tech: ['Next-Gen Propulsion', 'Additive Manufacturing', 'Composite Structures R&D'],
            applications: ['Future Platforms', 'Space-Adjacent Systems', 'Technology Licensing'],
            phase: 'Research Phase', phaseNum: 2,
        },
    ];

    const team: TeamMember[] = [
        {
            name: 'A. Rajeshkanna', initials: 'AR',
            role: 'CEO', title: 'Chief Executive Officer',
            desc: 'Leads Davina Aerospace\'s vision, strategy, investor partnerships, and long-term direction. The driving force behind the company\'s mission to build world-class aerospace systems from India.',
            domains: ['Strategy', 'Partnerships', 'Investor Relations'],
        },
        {
            name: 'Koshik Goswami', initials: 'KG',
            role: 'COO', title: 'Chief Operations Officer',
            desc: 'Manages daily operations, project execution, manufacturing coordination, and company workflow. Ensures that the vision translates into measurable engineering progress.',
            domains: ['Operations', 'Execution', 'Manufacturing'],
        },
        {
            name: 'Ashriith', initials: 'AS',
            role: 'CTO', title: 'Chief Technology Officer',
            desc: 'Heads all research, engineering, avionics systems, autonomous platforms, propulsion, and AI integration. The architect of Davina\'s technical roadmap.',
            domains: ['R&D', 'Avionics', 'AI Systems'],
        },
        {
            name: 'Siddiq', initials: 'SD',
            role: 'CDO', title: 'Chief Design Officer',
            desc: 'Leads aircraft architecture, aerodynamics, structural design, cockpit interface, and platform aesthetics. Defines the visual and physical identity of Davina\'s platforms.',
            domains: ['Aerodynamics', 'Structures', 'Platform Design'],
        },
        {
            name: 'Taran', initials: 'TR',
            role: 'Strategy', title: 'Strategic Business Consultant',
            desc: 'Guides growth strategy, market positioning, funding pathways, commercial planning, and scalable business development for Davina\'s international expansion.',
            domains: ['Business Dev', 'Market Strategy', 'Growth'],
        },
    ];

    const techPillars = [
        {
            icon: <Target size={22} />,
            title: 'Autonomous Drone Systems',
            desc: 'Purpose-built UAV platforms engineered for surveillance, defence logistics, and tactical operations in complex and contested environments.',
            tags: ['UAV Platforms', 'Tactical Systems', 'Autonomous Control'],
            id: 'tech-autonomous',
        },
        {
            icon: <Zap size={22} />,
            title: 'Aerospace Intelligence',
            desc: 'AI-driven mission planning, onboard neural processing, and adaptive systems that enable real-time decision-making without ground dependency.',
            tags: ['Mission AI', 'Neural Processing', 'Adaptive Systems'],
            id: 'tech-ai',
        },
        {
            icon: <Radar size={22} />,
            title: 'Navigation & Guidance',
            desc: 'Resilient multi-source positioning and autonomous routing engineered to maintain precision in GPS-denied and contested airspace environments.',
            tags: ['GPS-Denied Ops', 'INS Fusion', 'Route Optimization'],
            id: 'tech-nav',
        },
    ];

    const programs = [
        {
            icon: <Handshake size={22} />,
            title: 'Strategic Partnership',
            desc: 'Joint development, technology licensing, and co-creation opportunities for defence organizations and aerospace OEMs seeking autonomous systems capability.',
            cta: 'Discuss Partnership',
            id: 'prog-partner',
        },
        {
            icon: <TrendingUp size={22} />,
            title: 'Investment',
            desc: 'Davina Aerospace is actively seeking strategic investment partners to accelerate prototype development, platform testing, and market entry.',
            cta: 'Request Investor Brief',
            highlight: true,
            id: 'prog-invest',
        },
        {
            icon: <Users size={22} />,
            title: 'Talent & Collaboration',
            desc: 'Aerospace engineers, researchers, avionics specialists, and advisors who want to shape the next generation of Indian defence technology.',
            cta: 'Join the Team',
            id: 'prog-talent',
        },
    ];

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState(s => ({ ...s, sent: true }));
    };

    return (
        <div className="relative w-full min-h-screen bg-transparent text-white overflow-x-hidden" style={{ fontFamily: 'var(--font-body)' }}>

            {/* ── THREE.JS SCENE ── */}
            <Scene
                routeActive={false}
                routeDefinition={{ originLabel: '', origin: { lat: 0, lon: 0 }, destLabel: '', dest: { lat: 0, lon: 0 } }}
            />

            {/* Custom precision cursor — hides on touch devices automatically */}
            <AerospaceCursor />

            {/* Subtle scanline atmosphere */}
            <VigilanceHUD />

            {/* Only one navigation bar — nothing above it */}
            <Navbar />

            {/* Scroll progress indicator — thin cyan line tracking page progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] z-[150] origin-left bg-gradient-to-r from-cyan-500 via-cyan-300 to-sky-400 pointer-events-none"
                style={{ scaleX: scrollScale }}
            />

            {/* ── BOOT SCREEN ── */}
            <AnimatePresence>
                {isBooting && (
                    <motion.div
                        exit={{ opacity: 0, filter: 'blur(32px)' }}
                        transition={{ duration: 0.55 }}
                        className="fixed inset-0 z-[200] bg-[#000103] flex flex-col items-center justify-center"
                    >
                        <div className="label-mono mb-5">DAVINA PLATFORM INITIALIZING</div>
                        <div className="w-56 h-px bg-white/[0.06] relative overflow-hidden rounded">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/40 via-cyan-400 to-cyan-500/40"
                                animate={{ width: `${Math.max(6, progress)}%` }}
                                transition={{ ease: 'easeOut', duration: 0.3 }}
                            />
                        </div>
                        <div className="mt-4 font-mono text-[0.65rem] tracking-[0.3em] text-cyan-300/70 tabular-nums">
                            {String(Math.round(progress)).padStart(3, '0')}%
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT ── */}
            <main className="relative z-10 w-full">

                {/* ═══════════════════════════════════════
                    HERO SECTION — Central Vertical Axis
                    Order: Logo → Headline → Description → CTAs
                    Drone & Earth live in the 3D canvas behind this.
                ═══════════════════════════════════════ */}
                <section
                    id="home"
                    className="hero-section"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.75, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="hero-content"
                    >
                        {/* ── COUNTRY IDENTIFIER ── */}
                        <div className="hero-eyebrow">
                            <div className="hero-eyebrow-line" />
                            <span className="hero-eyebrow-text">
                                Davina Aerospace &nbsp;·&nbsp; India
                            </span>
                            <div className="hero-eyebrow-line" />
                        </div>

                        {/* ── LOGO — Primary focal point ── */}
                        <div className="hero-logo-wrapper">
                            <DavinaLogo variant="hero" />
                        </div>

                        {/* ── HEADLINE ── */}
                        <h1 className="hero-headline">
                            Engineering Autonomous{' '}
                            <span className="hero-headline-accent">Aerospace Systems</span>
                        </h1>

                        {/* ── DESCRIPTION ── */}
                        <p className="hero-description">
                            Intelligent unmanned platforms, advanced avionics, and
                            next-generation aerial systems — engineered for national
                            security and strategic operations.
                        </p>

                        {/* ── CTA BUTTONS ── */}
                        <div className="hero-ctas pointer-events-auto">
                            <a href="#technology" className="btn-primary" id="hero-cta-platform">
                                Explore Platform
                                <ArrowUpRight size={15} />
                            </a>
                            <a href="#contact" className="btn-ghost" id="hero-cta-leadership">
                                Connect with Leadership
                            </a>
                        </div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.8, duration: 1.0 }}
                        className="hero-scroll-cue pointer-events-none"
                    >
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                        >
                            <ChevronDown size={16} className="text-white/18" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* ═══════════════════════════════════════
                    TECHNOLOGY SECTION
                ═══════════════════════════════════════ */}
                <Section id="technology" className="py-20 md:py-28 px-6 md:px-12 bg-gradient-to-b from-transparent via-[#000103]/85 to-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 max-w-2xl reveal">
                            <SectionLabel>Technology Platform</SectionLabel>
                            <h2
                                className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white mb-5"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                            >
                                Systems Built for<br />
                                <span className="text-cyan-400">Real-World Operations</span>
                            </h2>
                            <p className="body-base text-slate-400 leading-relaxed">
                                Autonomous systems engineered for the full spectrum of operational conditions — from contested airspace to GPS-denied environments and beyond.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {techPillars.map((pillar, idx) => (
                                <motion.div
                                    key={pillar.id}
                                    id={pillar.id}
                                    initial={{ opacity: 0, y: 32 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    className="card-glass p-7 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/18 transition-colors">
                                        {pillar.icon}
                                    </div>
                                    <h3
                                        className="text-lg font-semibold text-white mb-3"
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        {pillar.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                        {pillar.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {pillar.tags.map(tag => (
                                            <span key={tag} className="text-[0.6rem] font-mono tracking-[0.12em] uppercase px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-slate-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    DAVINA FRAMEWORK SECTION
                ═══════════════════════════════════════ */}
                <Section id="mission" className="py-20 md:py-28 px-6 md:px-12 bg-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16 text-center reveal">
                            <SectionLabel>The DAVINA Framework</SectionLabel>
                            <h2
                                className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                            >
                                Six Strategic Technology<br />
                                <span className="text-cyan-400">Divisions</span>
                            </h2>
                            <p className="body-base text-slate-400 mt-5 max-w-xl mx-auto leading-relaxed">
                                Each letter of DAVINA represents a core strategic division — engineering the complete aerospace technology stack of tomorrow.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {acronyms.map((item, idx) => (
                                <motion.div
                                    key={`${item.title}-${idx}`}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: idx * 0.08, duration: 0.45 }}
                                    onClick={() => setActiveAcronym(item.title)}
                                    className={`relative card-glass p-7 cursor-pointer group overflow-hidden transition-all duration-200
                                        ${activeAcronym === item.title ? 'border-cyan-500/35 bg-cyan-900/10 davina-card-active' : ''}`}
                                >
                                    {/* Background letter */}
                                    <div className="absolute top-4 right-4 text-7xl font-black font-mono opacity-[0.04] group-hover:opacity-[0.07] transition-opacity select-none pointer-events-none" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {item.letter}
                                    </div>

                                    {/* Phase badge */}
                                    <div className={`inline-flex items-center gap-1.5 text-[0.55rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-full mb-5 border ${
                                        item.phaseNum === 1
                                            ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                                            : 'bg-white/[0.04] border-white/[0.08] text-slate-500'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.phaseNum === 1 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                                        Phase 0{item.phaseNum} · {item.phase}
                                    </div>

                                    {/* Icon + Title */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="text-cyan-500 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <h3
                                            className="text-xl font-bold tracking-wide uppercase"
                                            style={{ fontFamily: 'var(--font-display)' }}
                                        >
                                            <span className="text-cyan-500">{item.letter}</span>
                                            {item.title.substring(1)}
                                        </h3>
                                    </div>

                                    {/* Mission line */}
                                    <p className="text-sm font-medium text-white/80 mb-3 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                                        {item.mission}
                                    </p>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm leading-relaxed mb-5 font-light">
                                        {item.desc}
                                    </p>

                                    {/* Tech stack */}
                                    <div className="mb-4">
                                        <p className="label-mono text-slate-600 mb-2 text-[0.55rem]">Technology</p>
                                        <div className="flex flex-col gap-1">
                                            {item.tech.map(t => (
                                                <div key={t} className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="w-1 h-1 rounded-full bg-cyan-500/50 flex-shrink-0" />
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Application tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.applications.map(app => (
                                            <span key={app} className="text-[0.58rem] font-mono tracking-[0.1em] uppercase px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-slate-500">
                                                {app}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    ABOUT SECTION
                ═══════════════════════════════════════ */}
                <Section id="about" className="py-20 md:py-28 px-6 md:px-12 bg-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
                            {/* Left */}
                            <div className="reveal">
                                <SectionLabel>About Davina</SectionLabel>
                                <h2
                                    className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white mb-8"
                                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                                >
                                    Built in India.<br />
                                    <span className="text-cyan-400">Engineered</span><br />
                                    for the World.
                                </h2>

                                {/* Pillar stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard value="2024" label="Founded" />
                                    <StatCard value="India" label="Headquarters" />
                                    <StatCard value="6" label="Core Divisions" />
                                </div>
                            </div>

                            {/* Right */}
                            <div className="space-y-6 reveal">
                                <p className="text-slate-300 text-base md:text-lg leading-8">
                                    Davina Aerospace is an Indian-based private aerospace company built on one conviction: the future of defence and aerospace belongs to those bold enough to engineer it. We design advanced unmanned systems, autonomous platforms, and next-generation defence technologies — built to operate where conventional systems fall short.
                                </p>
                                <p className="text-slate-400 text-base leading-8">
                                    By combining rigorous engineering discipline with a vision for global operations, Davina Aerospace is positioned to deliver world-class defence and aerospace solutions from India to allied nations and international partners.
                                </p>

                                {/* Vision pull quote */}
                                <div className="border-l-2 border-cyan-500/40 pl-5 mt-8">
                                    <p
                                        className="text-white text-lg md:text-xl font-medium leading-relaxed italic"
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        "Our mission is to build powerful aerospace systems that redefine flight, strengthen strategic partnerships with allied nations, and expand humanity's reach beyond Earth."
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    {['Make in India', 'Allied Nation Support', 'Mission-Critical Engineering', 'Sovereign Technology'].map(tag => (
                                        <span key={tag} className="text-[0.62rem] font-mono tracking-[0.12em] uppercase px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded text-slate-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    LEADERSHIP SECTION
                ═══════════════════════════════════════ */}
                <Section id="leadership" className="py-20 md:py-28 px-6 md:px-12 bg-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-14 reveal">
                            <SectionLabel>Leadership</SectionLabel>
                            <h2
                                className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                            >
                                The Team Behind<br />
                                <span className="text-cyan-400">the Mission</span>
                            </h2>
                        </div>

                        {/* Top row: CEO prominent + COO + CTO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                            {team.slice(0, 3).map((person, idx) => (
                                <motion.article
                                    key={person.name}
                                    id={`leader-${person.role.toLowerCase()}`}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: idx * 0.1, duration: 0.45 }}
                                    className={`card-glass p-7 group ${idx === 0 ? 'md:col-span-1' : ''}`}
                                >
                                    {/* Monogram */}
                                    <div className="mb-6 relative">
                                        <div className="h-16 w-16 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 to-blue-600/10 flex items-center justify-center text-white font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                                            {person.initials}
                                        </div>
                                    </div>

                                    {/* Role badge */}
                                    <div className="label-mono text-cyan-400 mb-2 text-[0.6rem]">{person.role}</div>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                        {person.name}
                                    </h3>

                                    {/* Title */}
                                    <p className="text-cyan-300/70 text-xs font-mono tracking-wide mb-4">{person.title}</p>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{person.desc}</p>

                                    {/* Domain tags */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {person.domains.map(d => (
                                            <span key={d} className="text-[0.58rem] font-mono tracking-[0.1em] uppercase px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-slate-500">
                                                {d}
                                            </span>
                                        ))}
                                    </div>

                                    {/* LinkedIn placeholder */}
                                    <a
                                        href="#contact"
                                        aria-label={`Connect with ${person.name} on LinkedIn`}
                                        className="inline-flex items-center gap-1.5 text-[0.6rem] font-mono tracking-[0.1em] uppercase text-slate-600 hover:text-cyan-400 transition-colors"
                                    >
                                        <Linkedin size={12} />
                                        Connect
                                    </a>
                                </motion.article>
                            ))}
                        </div>

                        {/* Bottom row: CDO + Consultant */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {team.slice(3).map((person, idx) => (
                                <motion.article
                                    key={person.name}
                                    id={`leader-${person.role.toLowerCase().replace(' ', '-')}`}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: (idx + 3) * 0.1, duration: 0.45 }}
                                    className="card-glass p-7 group"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="h-14 w-14 flex-shrink-0 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/08 flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                                            {person.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="label-mono text-cyan-400 mb-1 text-[0.58rem]">{person.role}</div>
                                            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{person.name}</h3>
                                            <p className="text-cyan-300/60 text-xs font-mono tracking-wide mb-3">{person.title}</p>
                                            <p className="text-slate-400 text-sm leading-relaxed mb-4">{person.desc}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {person.domains.map(d => (
                                                    <span key={d} className="text-[0.57rem] font-mono tracking-[0.1em] uppercase px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-slate-500">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    PROGRAMS & INVESTMENT SECTION
                ═══════════════════════════════════════ */}
                <Section id="programs" className="py-20 md:py-28 px-6 md:px-12 bg-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-14 max-w-2xl reveal">
                            <SectionLabel>Programs & Investment</SectionLabel>
                            <h2
                                className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white mb-5"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                            >
                                Strategic Opportunities<br />
                                <span className="text-cyan-400">for Partners</span>
                            </h2>
                            <p className="body-base text-slate-400 leading-relaxed">
                                Whether you're an investor, a defence organization, or an aerospace professional — there's a path to build with Davina Aerospace.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                            {programs.map((prog, idx) => (
                                <motion.div
                                    key={prog.id}
                                    id={prog.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: idx * 0.1, duration: 0.45 }}
                                    className={`card-glass p-7 flex flex-col ${prog.highlight ? 'border-cyan-500/25 bg-cyan-900/10' : ''}`}
                                >
                                    {prog.highlight && (
                                        <div className="label-mono text-amber-400 mb-4 text-[0.58rem]">
                                            ★ Actively Seeking Partners
                                        </div>
                                    )}
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 mb-5">
                                        {prog.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                                        {prog.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">
                                        {prog.desc}
                                    </p>
                                    <a href="#contact" className={prog.highlight ? 'btn-primary text-center justify-center' : 'btn-ghost text-center justify-center'}>
                                        {prog.cta}
                                        <ArrowUpRight size={12} />
                                    </a>
                                </motion.div>
                            ))}
                        </div>

                        {/* Investor pitch strip */}
                        <div className="rounded-xl border border-amber-500/15 bg-gradient-to-r from-amber-500/[0.05] to-cyan-500/[0.04] p-8 text-center reveal">
                            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                                Davina Aerospace is actively seeking{' '}
                                <span className="text-amber-300 font-medium">strategic investment partners</span>{' '}
                                to accelerate prototype development, platform testing, and market entry into allied defence markets.
                            </p>
                            <a href="#contact" className="btn-primary inline-flex mx-auto">
                                Request Investor Briefing
                                <ArrowUpRight size={13} />
                            </a>
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    CONTACT SECTION
                ═══════════════════════════════════════ */}
                <Section id="contact" className="py-20 md:py-28 px-6 md:px-12 bg-[#000103] border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-14 reveal">
                            <SectionLabel>Connect</SectionLabel>
                            <h2
                                className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-white"
                                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                            >
                                Connect with<br />
                                <span className="text-cyan-400">Leadership</span>
                            </h2>
                        </div>

                        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
                            {/* Left — Company info */}
                            <div className="space-y-5">
                                <div id="contact-email" className="card-glass p-6 flex items-start gap-4">
                                    <div className="text-cyan-400 mt-0.5 flex-shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="label-mono mb-2 text-[0.58rem]">Email</p>
                                        <a
                                            href="mailto:contact@davinaaerospace.com"
                                            className="text-white hover:text-cyan-400 transition-colors text-base"
                                            style={{ fontFamily: 'var(--font-display)' }}
                                        >
                                            contact@davinaaerospace.com
                                        </a>
                                    </div>
                                </div>
                                <div id="contact-location" className="card-glass p-6 flex items-start gap-4">
                                    <div className="text-cyan-400 mt-0.5 flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="label-mono mb-2 text-[0.58rem]">Base of Operations</p>
                                        <p className="text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>India</p>
                                        <p className="text-slate-500 text-xs mt-1">Global partnerships welcome</p>
                                    </div>
                                </div>

                                <div className="card-glass p-6">
                                    <p className="label-mono mb-4 text-[0.58rem]">Follow our journey</p>
                                    <div className="flex items-center gap-3">
                                        {[
                                            { icon: <Linkedin size={16} />, label: 'LinkedIn', href: '#' },
                                            { icon: <Twitter size={16} />, label: 'Twitter', href: '#' },
                                            { icon: <Github size={16} />, label: 'GitHub', href: '#' },
                                        ].map(s => (
                                            <a
                                                key={s.label}
                                                href={s.href}
                                                aria-label={s.label}
                                                className="w-9 h-9 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                                            >
                                                {s.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right — Contact form */}
                            <div className="card-glass p-8">
                                {formState.sent ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center text-center py-12"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                                            <Send size={20} />
                                        </div>
                                        <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                            Message Received
                                        </h3>
                                        <p className="text-slate-400 text-sm">We'll be in touch within 48 hours.</p>
                                    </motion.div>
                                ) : (
                                    <form id="contact-form" onSubmit={handleFormSubmit} className="space-y-5">
                                        <h3 className="text-white font-semibold text-lg mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                                            Start a Strategic Conversation
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="contact-name" className="label-mono text-slate-500 block mb-2 text-[0.58rem]">Your Name</label>
                                                <input
                                                    id="contact-name"
                                                    type="text"
                                                    required
                                                    placeholder="Full Name"
                                                    value={formState.name}
                                                    onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="contact-org" className="label-mono text-slate-500 block mb-2 text-[0.58rem]">Organization</label>
                                                <input
                                                    id="contact-org"
                                                    type="text"
                                                    placeholder="Company / Fund / Agency"
                                                    value={formState.org}
                                                    onChange={e => setFormState(s => ({ ...s, org: e.target.value }))}
                                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="contact-message" className="label-mono text-slate-500 block mb-2 text-[0.58rem]">Message</label>
                                            <textarea
                                                id="contact-message"
                                                required
                                                rows={5}
                                                placeholder="Tell us about your interest — investment, partnership, collaboration, or joining the team."
                                                value={formState.message}
                                                onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            id="contact-submit"
                                            className="w-full btn-primary justify-center py-3.5"
                                        >
                                            Send Message
                                            <Send size={13} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    FOOTER
                ═══════════════════════════════════════ */}
                <footer className="bg-[#000103] border-t border-white/[0.05] pt-14 pb-8 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                            {/* Brand column */}
                            <div className="col-span-2 md:col-span-1">
                                <div className="w-[120px] mb-4">
                                    <DavinaLogo variant="nav" />
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed mb-4 max-w-[180px]">
                                    Engineering the autonomous defence platforms of tomorrow — from India to the world.
                                </p>
                                <div className="flex gap-2">
                                    {[
                                        { icon: <Linkedin size={14} />, href: '#', label: 'LinkedIn' },
                                        { icon: <Twitter size={14} />, href: '#', label: 'Twitter' },
                                        { icon: <Github size={14} />, href: '#', label: 'GitHub' },
                                    ].map(s => (
                                        <a key={s.label} href={s.href} aria-label={s.label}
                                            className="w-8 h-8 rounded-md border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-slate-600 hover:text-cyan-400 hover:border-cyan-500/25 transition-all">
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Company links */}
                            <div>
                                <p className="label-mono text-slate-600 mb-4 text-[0.58rem]">Company</p>
                                <nav className="flex flex-col gap-3">
                                    {['About', 'Leadership', 'Programs', 'Contact'].map(l => (
                                        <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
                                            {l}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            {/* Technology links */}
                            <div>
                                <p className="label-mono text-slate-600 mb-4 text-[0.58rem]">Technology</p>
                                <nav className="flex flex-col gap-3">
                                    {['DAVINA Framework', 'Technology Platform', 'Autonomous Systems', 'Avionics'].map(l => (
                                        <a key={l} href="#technology" className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
                                            {l}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            {/* Connect */}
                            <div>
                                <p className="label-mono text-slate-600 mb-4 text-[0.58rem]">Connect</p>
                                <div className="flex flex-col gap-3">
                                    <a href="mailto:contact@davinaaerospace.com" className="text-slate-500 text-xs hover:text-slate-300 transition-colors break-all">
                                        contact@davinaaerospace.com
                                    </a>
                                    <p className="text-slate-600 text-xs">Base: India</p>
                                    <a href="#contact" className="btn-primary text-[0.6rem] px-3 py-2 mt-1 w-fit">
                                        Investor Brief →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-slate-700 font-mono text-[0.6rem] tracking-[0.3em] uppercase">
                                © 2026 Davina Aerospace · All Rights Reserved
                            </p>
                            <p className="text-slate-700 font-mono text-[0.6rem] tracking-[0.2em] uppercase">
                                Built in India · D · A · V · I · N · A
                            </p>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}
