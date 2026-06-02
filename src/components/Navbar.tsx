import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import DavinaLogo from './DavinaLogo';

const navItems = [
    { label: 'Home',         href: '#home' },
    { label: 'Technology',   href: '#technology' },
    { label: 'DAVINA',       href: '#mission' },
    { label: 'Programs',     href: '#programs' },
    { label: 'Leadership',   href: '#leadership' },
    { label: 'Vision',       href: '#about' },
    { label: 'Contact',      href: '#contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen]         = useState(false);
    const [scrolled, setScrolled]     = useState(false);
    const [activeSection, setActive]  = useState('home');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 32);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // IntersectionObserver — tracks which section is visible
    useEffect(() => {
        const ids = navItems.map(i => i.href.slice(1));
        const observers: IntersectionObserver[] = [];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([e]) => { if (e.isIntersecting) setActive(id); },
                { threshold: 0.25, rootMargin: '-72px 0px -40% 0px' }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    return (
        <>
            {/* ── HEADER BAR ─────────────────────────────────────────── */}
            <header
                className={`fixed top-0 left-0 right-0 z-[250] pointer-events-auto transition-all duration-400 ${
                    scrolled
                        ? 'bg-[#000103]/90 backdrop-blur-2xl border-b border-white/[0.05]'
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">

                    {/* Logo */}
                    <a
                        href="#home"
                        aria-label="Davina Aerospace"
                        className="flex-shrink-0 mr-10"
                        onClick={() => setIsOpen(false)}
                    >
                        <DavinaLogo variant="nav" />
                    </a>

                    {/* Desktop nav — Space Grotesk, 14px, minimal tracking */}
                    <nav
                        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10"
                        aria-label="Primary"
                    >
                        {navItems.map(item => {
                            const id = item.href.slice(1);
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={`nav-link ${activeSection === id ? 'active' : ''}`}
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/*
                            Investor Brief — bordered button, NOT solid fill.
                            Matches Anduril "Join Us" / Shield AI CTA style.
                        */}
                        <a
                            href="#contact"
                            id="nav-investor-cta"
                            className="hidden lg:inline-flex items-center gap-2 px-5 py-2 rounded text-sm font-medium text-white/85 border border-white/[0.18] hover:border-cyan-500/40 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.005em' }}
                        >
                            Investor Brief
                            <ArrowUpRight size={14} strokeWidth={2} className="text-cyan-400/70" />
                        </a>

                        {/* Mobile hamburger */}
                        <button
                            id="nav-menu-btn"
                            onClick={() => setIsOpen(v => !v)}
                            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MOBILE OVERLAY ─────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[240] bg-[#000103]/98 backdrop-blur-3xl flex flex-col justify-center px-8 pointer-events-auto lg:hidden"
                    >
                        {/* Close */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-5 right-6 p-2 text-white/40 hover:text-white transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={22} />
                        </button>

                        {/* Nav items */}
                        <nav className="flex flex-col" aria-label="Mobile navigation">
                            {navItems.map((item, idx) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                                    className="py-4 text-3xl font-semibold text-white/80 hover:text-white border-b border-white/[0.05] last:border-none transition-colors"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                >
                                    {item.label}
                                </motion.a>
                            ))}
                        </nav>

                        {/* Mobile CTA */}
                        <motion.a
                            href="#contact"
                            onClick={() => setIsOpen(false)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42, duration: 0.22 }}
                            className="mt-10 inline-flex items-center gap-2 w-fit px-6 py-3 text-sm font-medium text-white border border-white/20 rounded hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Investor Brief
                            <ArrowUpRight size={15} className="text-cyan-400/70" />
                        </motion.a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
