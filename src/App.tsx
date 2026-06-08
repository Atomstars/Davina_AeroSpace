import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import AerospaceCursor from './components/AerospaceCursor';
import VigilanceHUD from './components/VigilanceHUD';
import DavinaLogo from './components/DavinaLogo';
import Reveal from './components/Reveal';
import Magnetic from './components/Magnetic';
import AmbientBackdrop from './components/AmbientBackdrop';
import { useSmoothScroll } from './lib/scroll';
import {
    heroContent, staggerContainer, staggerItem, viewportOnce, spring,
} from './lib/motion';
import {
    Cpu, Crosshair, ShieldCheck, Navigation,
    Mail, MapPin, ArrowUpRight, ChevronDown, Send,
    Users, TrendingUp,
    Linkedin, Twitter, Github,
    Feather, Recycle, FlaskConical, Satellite, Plane,
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
// Reveals are now self-contained Framer components (<Reveal> / staggered
// motion children), so the section is a plain semantic wrapper.
function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={className}>
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
            mission: 'Reusable tactical hardware. Zero per-engagement disposal.',
            desc: 'Reusable tactical interceptors that recover, refuel, and re-deploy — eliminating the single-use missile cycle that makes conventional interception financially unsustainable at operational tempo.',
            tech: ['Reusable Interceptors', 'Autonomous Return-to-Base', 'Low-Acoustic SMA Control'],
            applications: ['Border Interdiction', 'Adaptive Re-engagement', 'Covert Low-Altitude Patrol'],
            phase: 'R&D', phaseNum: 2,
        },
        {
            letter: 'A', title: 'Aerospace', icon: <Plane size={20} />,
            mission: 'Bio-inspired morphing-wing flight, validated.',
            desc: 'Solid-state Nitinol SMA actuators embedded in the trailing edge replace every hinged control surface — a gapless, continuous aerodynamic profile that adapts camber in real time, proven on DRONE MARK 1.',
            tech: ['Nitinol SMA Morphing Wing', 'Gapless Camber Control', 'Eppler 250 Airfoil'],
            applications: ['VTOL → Fixed-Wing UAV', 'Low-Reynolds Flight', 'Silent Manoeuvring'],
            phase: 'Validated', phaseNum: 1,
        },
        {
            letter: 'V', title: 'Vigilance', icon: <Crosshair size={20} />,
            mission: '111 minutes of persistent eyes on every horizon.',
            desc: 'DRONE MARK 1 carries modular ISR payloads (NDVI, FLIR, SAR) with a calculated 111-minute cruise endurance at 11.5 W — engineered for long-loiter surveillance where conventional multirotors last minutes.',
            tech: ['NDVI / FLIR / SAR Payloads', '111-min Cruise Endurance', 'Modular Payload Bay'],
            applications: ['Border Surveillance', 'ISR Loiter', 'Agricultural & SAR Mapping'],
            phase: 'Validated', phaseNum: 1,
        },
        {
            letter: 'I', title: 'Intelligence', icon: <Cpu size={20} />,
            mission: 'A GNC stack that learns once and flies everywhere.',
            desc: 'The Guidance, Navigation & Control software validated on the 3-second VTOL transition becomes the foundational autonomy layer for the Phase 2 interceptor and Phase 3 orbital return vectoring.',
            tech: ['GNC Software Stack', 'PWM Thermal Actuation Loop', 'Raspberry Pi Zero 2W'],
            applications: ['Autonomous Transition', 'Terminal-Phase Control', 'Return Vectoring'],
            phase: 'Validated', phaseNum: 1,
        },
        {
            letter: 'N', title: 'Navigation', icon: <Navigation size={20} />,
            mission: 'Autonomous return-and-refly as a primary load case.',
            desc: 'Autonomous vertical return-to-base guidance is engineered in from the first sketch — the control logic that lets a Davina platform recover itself instead of being discarded after every mission.',
            tech: ['Vertical Return-to-Base', 'Attitude & Recovery Control', 'Dynamically Stable (λ −0.5 ± 1.41i)'],
            applications: ['Recoverable Flight', 'Controlled De-orbit', 'Precision Placement'],
            phase: 'R&D', phaseNum: 2,
        },
        {
            letter: 'A', title: 'Advancement', icon: <FlaskConical size={20} />,
            mission: 'Green propellants and permanent space infrastructure.',
            desc: 'Proprietary high-energy-density green chemical propellants maximise specific impulse and eliminate toxic residuals — the propulsive foundation for reusable Orbital Transfer Vehicles and lasting space infrastructure.',
            tech: ['Green Chemical Propellant', 'Reusable OTVs', 'Debris-Elimination Protocol'],
            applications: ['Orbital Logistics', 'Satellite Placement', 'Permanent Infrastructure'],
            phase: 'R&D', phaseNum: 3,
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
            name: 'Kaushik Goswami', initials: 'KG',
            role: 'COO', title: 'Chief Operations Officer',
            desc: 'Manages daily operations, project execution, manufacturing coordination, and company workflow. Ensures that the vision translates into measurable engineering progress.',
            domains: ['Operations', 'Execution', 'Manufacturing'],
        },
        {
            name: 'Ashriith', initials: 'AS',
            role: 'CTO', title: 'Chief Technology Officer',
            desc: 'Leads the morphing-wing SMA integration programme, GNC software development, and propellant R&D — validating every technical KPI prior to each phase transition. The architect of Davina\'s technical roadmap.',
            domains: ['SMA Integration', 'GNC Software', 'Propellant R&D'],
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
            icon: <Feather size={22} />,
            title: 'Morphing-Wing Flight Intelligence',
            desc: 'Nitinol Shape Memory Alloy actuators embedded directly in the trailing edge eliminate hinged control surfaces entirely — a gapless, continuous profile that adapts camber in real time, like avian flight without mechanical articulation.',
            tags: ['Nitinol SMA', 'Gapless Camber', 'Bio-Inspired'],
            id: 'tech-morphing',
        },
        {
            icon: <Recycle size={22} />,
            title: 'Structural Conservation Architecture',
            desc: 'Every platform is designed with reusability as a primary load case, not an afterthought. Stage-detachment debris is eliminated through precision structural engineering that keeps all primary components recoverable and re-deployable.',
            tags: ['Zero-Debris', 'Recoverable Structure', 'Reusable by Design'],
            id: 'tech-structure',
        },
        {
            icon: <FlaskConical size={22} />,
            title: 'High-Energy-Density Propellant',
            desc: 'For space logistics, Davina is developing proprietary green chemical propellants engineered to maximise specific impulse while eliminating the toxic residuals that compromise ground handling and orbital environments.',
            tags: ['Green Chemistry', 'High Specific Impulse', 'Non-Toxic'],
            id: 'tech-propellant',
        },
        {
            icon: <Cpu size={22} />,
            title: 'Autonomous Reusability Intelligence',
            desc: 'The GNC software stack validated on the Phase 1 morphing-wing UAV forms the foundational control layer for autonomous vertical return-to-base — applicable directly from the tactical interceptor to the orbital transfer vehicle.',
            tags: ['GNC Stack', 'Return-to-Base', 'Cross-Platform'],
            id: 'tech-gnc',
        },
    ];

    const programs = [
        {
            icon: <ShieldCheck size={22} />,
            title: 'Flight Trial Partners',
            desc: 'Defence procurement officers, military R&D establishments, and DRDO-affiliated institutions are invited to engage the DRONE MARK 1 prototype for field evaluation — modular payload integration (NDVI, FLIR, SAR), full technical disclosure under NDA.',
            cta: 'Flight Trial Enquiry',
            id: 'prog-flighttrial',
        },
        {
            icon: <TrendingUp size={22} />,
            title: 'Strategic Co-Investment',
            desc: 'Davina is raising its seed / pre-Series A round to fund the transition from validated prototype to Phase 2 interceptor R&D and Phase 3 propellant development — three compounding, independently defensible technology moats.',
            cta: 'Investment Enquiry',
            highlight: true,
            id: 'prog-invest',
        },
        {
            icon: <Users size={22} />,
            title: 'Engineering Talent',
            desc: 'Aerospace, structures, controls, and propulsion engineers who want to build reusable, material-conservative defence and space technology from Chennai — and shape India\'s deep-tech aerospace pipeline.',
            cta: 'Join the Team',
            id: 'prog-talent',
        },
    ];

    // Technology roadmap — the three core phases from the portfolio.
    const phases = [
        {
            id: 'phase-1',
            num: '01',
            icon: <Plane size={22} />,
            title: 'Morphing-Wing UAV',
            codename: 'DRONE MARK 1',
            status: 'Prototype Validated',
            statusActive: true,
            desc: 'A fully validated proof-of-concept for bio-inspired morphing-wing flight. All mechanical actuation is replaced by a solid-state Nitinol SMA system in a silicone elastomer trailing edge, operating in the demanding low-Reynolds regime (Re ≈ 1.62 × 10⁵) with a full VTOL-to-fixed-wing transition in 3.0 seconds.',
            tags: ['Nitinol SMA Wing', 'VTOL Hybrid', 'CFD + MATLAB Validated'],
        },
        {
            id: 'phase-2',
            num: '02',
            icon: <ShieldCheck size={22} />,
            title: 'Reusable Tactical Interceptor',
            codename: 'GNC CONTINUITY',
            status: 'R&D Stage',
            statusActive: false,
            desc: 'Extends the validated GNC stack and SMA morphing surfaces into the interceptor domain. The objective is autonomous vertical return-to-base — a single-body system with recoverable propulsion that eliminates the missile-disposal cycle, with reduced radar and acoustic signature.',
            tags: ['Vertical Return-to-Base', 'Recoverable Propulsion', 'Low-Signature'],
        },
        {
            id: 'phase-3',
            num: '03',
            icon: <Satellite size={22} />,
            title: 'Space Logistics & Propellants',
            codename: 'ORBITAL TRANSFER',
            status: 'R&D Stage',
            statusActive: false,
            desc: 'Entry into orbital logistics via reusable Orbital Transfer Vehicles and proprietary high-energy-density green propellants. Zero hardware abandoned per mission — every stage engineered for controlled de-orbit or recovery, toward a doctrine of permanent space infrastructure.',
            tags: ['Reusable OTVs', 'Green Propellant', 'Zero-Debris'],
        },
    ];

    // DRONE MARK 1 — headline validated performance figures.
    const droneSpecs = [
        { value: '111 min', label: 'Cruise Endurance' },
        { value: '18 m/s', label: 'Cruise Velocity' },
        { value: '3.0 s', label: 'VTOL Transition' },
        { value: '14.29', label: 'Lift-to-Drag Ratio' },
        { value: '10.42', label: 'Factor of Safety' },
        { value: '0.888 m', label: 'Wingspan (AR 8.67)' },
        { value: '11.5 W', label: 'Cruise Power Draw' },
        { value: '< 1.5 s', label: 'SMA Actuation' },
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

            {/* Living ambient field behind content — fades in past the hero so
                scrolled sections never collapse to flat black. */}
            <AmbientBackdrop />

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
                    {/*
                        Hero entrance is bound to preloader completion (!isBooting),
                        not a fixed delay — children stagger in once the scene is ready.
                    */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate={isBooting ? 'hidden' : 'visible'}
                        className="hero-content"
                    >
                        {/* ── COUNTRY IDENTIFIER ── */}
                        <motion.div variants={staggerItem} className="hero-eyebrow">
                            <div className="hero-eyebrow-line" />
                            <span className="hero-eyebrow-text">
                                Davina Aerospace &nbsp;·&nbsp; Chennai, India
                            </span>
                            <div className="hero-eyebrow-line" />
                        </motion.div>

                        {/* ── LOGO — Primary focal point ── */}
                        <motion.div variants={heroContent} className="hero-logo-wrapper">
                            <DavinaLogo variant="hero" />
                        </motion.div>

                        {/* ── HEADLINE ── */}
                        <motion.h1 variants={staggerItem} className="hero-headline">
                            Engineered to{' '}
                            <span className="hero-headline-accent">Outlast Every Mission</span>
                        </motion.h1>

                        {/* ── DESCRIPTION ── */}
                        <motion.p variants={staggerItem} className="hero-description">
                            Morphing-wing flight intelligence, autonomous reusability, and
                            high-energy-density propulsion — engineering permanent space
                            infrastructure and endlessly reusable defence technologies.
                        </motion.p>

                        {/* ── CTA BUTTONS ── */}
                        <motion.div variants={staggerItem} className="hero-ctas pointer-events-auto">
                            <Magnetic className="inline-flex">
                                <a href="#technology" className="btn-primary" id="hero-cta-platform">
                                    Explore Platform
                                    <ArrowUpRight size={15} />
                                </a>
                            </Magnetic>
                            <Magnetic className="inline-flex">
                                <a href="#contact" className="btn-ghost" id="hero-cta-leadership">
                                    Connect with Leadership
                                </a>
                            </Magnetic>
                        </motion.div>
                    </motion.div>

                    {/* Scroll indicator — fades in once the hero has settled */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isBooting ? 0 : 1 }}
                        transition={{ delay: isBooting ? 0 : 0.9, duration: 1.0 }}
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
                <Section id="technology" className="py-20 md:py-28 px-6 md:px-12 bg-gradient-to-b from-transparent via-[#03060f]/40 to-[#03060f]/50 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-16 max-w-2xl">
                            <SectionLabel>The Davina Solution</SectionLabel>
                            <h2
                                className="heading-section uppercase text-white mb-5"
                            >
                                Re-Engineering the<br />
                                <span className="text-cyan-400">Foundations of Flight</span>
                            </h2>
                            <p className="body-base text-slate-400 leading-relaxed">
                                Davina re-engineers the relationship between propulsion architecture, structural material use, and flight-control intelligence — operating on simultaneous axes to eliminate the compounding failures that constrain conventional aerospace.
                            </p>
                        </Reveal>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {techPillars.map((pillar) => (
                                <motion.div
                                    key={pillar.id}
                                    id={pillar.id}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
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
                        </motion.div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    TECHNOLOGY ROADMAP — 3 PHASES + DRONE MARK 1 DATA SHEET
                ═══════════════════════════════════════ */}
                <Section id="roadmap" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-16 max-w-2xl">
                            <SectionLabel>Technology Roadmap</SectionLabel>
                            <h2 className="heading-section uppercase text-white mb-5">
                                Three Phases.<br />
                                <span className="text-cyan-400">One Doctrine.</span>
                            </h2>
                            <p className="body-base text-slate-400 leading-relaxed">
                                From a validated morphing-wing UAV to reusable tactical interceptors and orbital transfer vehicles — every phase reuses the GNC, structural, and control engineering proven by the last.
                            </p>
                        </Reveal>

                        {/* Phase cards */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {phases.map((ph) => (
                                <motion.div
                                    key={ph.id}
                                    id={ph.id}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
                                    className="card-glass p-7 flex flex-col relative overflow-hidden"
                                >
                                    <div className="absolute top-3 right-5 text-7xl font-black font-mono opacity-[0.05] select-none pointer-events-none" style={{ fontFamily: 'var(--font-mono)' }}>
                                        {ph.num}
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 text-[0.55rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-full mb-5 border self-start ${
                                        ph.statusActive
                                            ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400'
                                            : 'bg-white/[0.04] border-white/[0.08] text-slate-500'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${ph.statusActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                                        Phase {ph.num} · {ph.status}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                                        {ph.icon}
                                    </div>
                                    <p className="label-mono text-slate-500 mb-1 text-[0.55rem]">{ph.codename}</p>
                                    <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                                        {ph.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">
                                        {ph.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ph.tags.map(t => (
                                            <span key={t} className="text-[0.58rem] font-mono tracking-[0.1em] uppercase px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-slate-500">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* DRONE MARK 1 — validated data sheet */}
                        <Reveal className="card-glass p-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
                                <div>
                                    <p className="label-mono mb-2 text-[0.58rem]">Validated Performance · Phase 01</p>
                                    <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                        DRONE MARK 1 — Data Sheet
                                    </h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-[0.55rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/25 text-cyan-400 self-start">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CFD + MATLAB Validated
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-lg overflow-hidden">
                                {droneSpecs.map(s => (
                                    <div key={s.label} className="bg-[#05080f]/70 px-4 py-5 text-center">
                                        <p className="text-xl md:text-2xl font-bold text-white mb-1 tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                                            {s.value}
                                        </p>
                                        <p className="label-mono text-slate-500 text-[0.55rem]">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    DAVINA FRAMEWORK SECTION
                ═══════════════════════════════════════ */}
                <Section id="mission" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-16 text-center">
                            <SectionLabel>The DAVINA Framework</SectionLabel>
                            <h2
                                className="heading-section uppercase text-white"
                            >
                                Six Principles.<br />
                                <span className="text-cyan-400">One Platform.</span>
                            </h2>
                            <p className="body-base text-slate-400 mt-5 max-w-xl mx-auto leading-relaxed">
                                Each letter of DAVINA names a principle the platform is built on — from validated morphing-wing flight to the reusable interceptor and orbital logistics now in R&D.
                            </p>
                        </Reveal>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {acronyms.map((item, idx) => (
                                <motion.div
                                    key={`${item.title}-${idx}`}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
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
                        </motion.div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    ABOUT SECTION
                ═══════════════════════════════════════ */}
                <Section id="about" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
                            {/* Left */}
                            <Reveal>
                                <SectionLabel>About Davina</SectionLabel>
                                <h2
                                    className="heading-section uppercase text-white mb-8"
                                >
                                    Reusability is<br />
                                    <span className="text-cyan-400">the First</span><br />
                                    Constraint.
                                </h2>

                                {/* Pillar stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard value="Chennai" label="Headquarters" />
                                    <StatCard value="3" label="Technology Phases" />
                                    <StatCard value="MK 1" label="Prototype Validated" />
                                </div>
                            </Reveal>

                            {/* Right */}
                            <Reveal className="space-y-6" delay={0.12}>
                                <p className="text-slate-300 text-base md:text-lg leading-8">
                                    Davina Aerospace is a Chennai-based deep-tech company re-engineering the foundational relationship between propulsion, structural material use, and flight-control intelligence. Our mission is to engineer reusable, material-conservative aerospace and defence technologies that outlast every mission cycle.
                                </p>
                                <p className="text-slate-400 text-base leading-8">
                                    Across three phases — a validated morphing-wing UAV, a reusable tactical interceptor, and orbital transfer vehicles with proprietary green propellants — every vehicle, stage, and system is engineered to return, be rebuilt, and fly again. Nothing is discarded that was not designed to be discarded.
                                </p>

                                {/* Doctrine pull quote */}
                                <div className="border-l-2 border-cyan-500/40 pl-5 mt-8">
                                    <p
                                        className="text-white text-lg md:text-xl font-medium leading-relaxed italic"
                                        style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                        "Reusability is not a feature to be added after design. It is the first constraint from which all engineering decisions must derive."
                                    </p>
                                    <p className="label-mono text-slate-500 mt-3 text-[0.58rem]">— Davina Aerospace Engineering Doctrine</p>
                                </div>

                                {/* Core engineering doctrine — North Star values */}
                                <div className="grid sm:grid-cols-3 gap-3 mt-4">
                                    {[
                                        { t: 'Technical Precision', d: 'Every specification derived from validated data.' },
                                        { t: 'Material Conservation', d: 'Every gram is accountable. Nothing wasted.' },
                                        { t: 'Reusability Intelligence', d: 'Autonomy and recovery are load cases, not options.' },
                                    ].map(v => (
                                        <div key={v.t} className="card-glass p-4">
                                            <p className="text-white text-sm font-semibold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>{v.t}</p>
                                            <p className="text-slate-400 text-xs leading-relaxed">{v.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    LEADERSHIP SECTION
                ═══════════════════════════════════════ */}
                <Section id="leadership" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-14">
                            <SectionLabel>Leadership</SectionLabel>
                            <h2
                                className="heading-section uppercase text-white"
                            >
                                The Team Behind<br />
                                <span className="text-cyan-400">the Mission</span>
                            </h2>
                        </Reveal>

                        {/* Top row: CEO prominent + COO + CTO */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {team.slice(0, 3).map((person, idx) => (
                                <motion.article
                                    key={person.name}
                                    id={`leader-${person.role.toLowerCase()}`}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
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
                        </motion.div>

                        {/* Bottom row: CDO + Consultant */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {team.slice(3).map((person) => (
                                <motion.article
                                    key={person.name}
                                    id={`leader-${person.role.toLowerCase().replace(' ', '-')}`}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
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
                        </motion.div>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    PROGRAMS & INVESTMENT SECTION
                ═══════════════════════════════════════ */}
                <Section id="programs" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-14 max-w-2xl">
                            <SectionLabel>Forward Plan · Call to Action</SectionLabel>
                            <h2
                                className="heading-section uppercase text-white mb-5"
                            >
                                Engage the<br />
                                <span className="text-cyan-400">DRONE MARK 1</span>
                            </h2>
                            <p className="body-base text-slate-400 leading-relaxed">
                                The prototype is built, CFD- and MATLAB-validated, and configured for immediate payload integration. Whether you evaluate, co-invest, or build — there is a path to engage Davina now.
                            </p>
                        </Reveal>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                        >
                            {programs.map((prog) => (
                                <motion.div
                                    key={prog.id}
                                    id={prog.id}
                                    variants={staggerItem}
                                    whileHover={{ y: -6, transition: spring.snappy }}
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
                        </motion.div>

                        {/* Investor pitch strip */}
                        <Reveal className="rounded-xl border border-amber-500/15 bg-gradient-to-r from-amber-500/[0.05] to-cyan-500/[0.04] p-8 text-center">
                            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                                Davina is raising its{' '}
                                <span className="text-amber-300 font-medium">seed / pre-Series A round</span>{' '}
                                to fund the transition from validated prototype to Phase 2 interceptor R&D and Phase 3 propellant development — three compounding, independently defensible technology moats.
                            </p>
                            <a href="mailto:davinaaerospace@gmail.com?subject=INVESTMENT%20ENQUIRY" className="btn-primary inline-flex mx-auto">
                                Investment Enquiry
                                <ArrowUpRight size={13} />
                            </a>
                        </Reveal>
                    </div>
                </Section>

                {/* ═══════════════════════════════════════
                    CONTACT SECTION
                ═══════════════════════════════════════ */}
                <Section id="contact" className="py-20 md:py-28 px-6 md:px-12 bg-[#03060f]/45 border-t border-white/[0.05]">
                    <div className="max-w-7xl mx-auto">
                        <Reveal className="mb-14">
                            <SectionLabel>Connect</SectionLabel>
                            <h2
                                className="heading-section uppercase text-white"
                            >
                                Connect with<br />
                                <span className="text-cyan-400">Leadership</span>
                            </h2>
                        </Reveal>

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
                                            href="mailto:davinaaerospace@gmail.com"
                                            className="text-white hover:text-cyan-400 transition-colors text-base"
                                            style={{ fontFamily: 'var(--font-display)' }}
                                        >
                                            davinaaerospace@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div id="contact-location" className="card-glass p-6 flex items-start gap-4">
                                    <div className="text-cyan-400 mt-0.5 flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="label-mono mb-2 text-[0.58rem]">Base of Operations</p>
                                        <p className="text-white text-base" style={{ fontFamily: 'var(--font-display)' }}>Chennai, India</p>
                                        <p className="text-slate-500 text-xs mt-1">Defence & global partnerships welcome</p>
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
                <footer className="bg-[#02040a]/75 border-t border-white/[0.05] pt-14 pb-8 px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                            {/* Brand column */}
                            <div className="col-span-2 md:col-span-1">
                                <div className="w-[120px] mb-4">
                                    <DavinaLogo variant="nav" />
                                </div>
                                <p className="text-slate-500 text-xs leading-relaxed mb-4 max-w-[200px]">
                                    Reusable, material-conservative aerospace and defence technologies — engineered in Chennai to outlast every mission.
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
                                    {[
                                        { label: 'Morphing-Wing UAV', href: '#roadmap' },
                                        { label: 'Reusable Interceptor', href: '#roadmap' },
                                        { label: 'Space Logistics', href: '#roadmap' },
                                        { label: 'DAVINA Framework', href: '#mission' },
                                    ].map(l => (
                                        <a key={l.label} href={l.href} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
                                            {l.label}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            {/* Connect */}
                            <div>
                                <p className="label-mono text-slate-600 mb-4 text-[0.58rem]">Connect</p>
                                <div className="flex flex-col gap-3">
                                    <a href="mailto:davinaaerospace@gmail.com" className="text-slate-500 text-xs hover:text-slate-300 transition-colors break-all">
                                        davinaaerospace@gmail.com
                                    </a>
                                    <p className="text-slate-600 text-xs">Base: Chennai, India</p>
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
