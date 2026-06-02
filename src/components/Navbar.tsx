import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import DavinaLogo from './DavinaLogo';

type NavbarProps = {
    showLogo: boolean;
};

const navItems = [
    { label: 'Mission', href: '#mission' },
    { label: 'About Us', href: '#about' },
    { label: 'Teams', href: '#teams' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'Fund', href: '#fund' },
];

export default function Navbar({ showLogo }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {showLogo && (
                    <motion.a
                        href="#home"
                        initial={{ opacity: 0, y: -12, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.92 }}
                        className="fixed top-8 left-10 z-[250] flex flex-col leading-none pointer-events-auto"
                        aria-label="Davina Aerospace home"
                    >
                        <DavinaLogo />
                    </motion.a>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-8 right-10 z-[250] p-4 bg-black/35 backdrop-blur-md border border-cyan-500/30 rounded-full text-white hover:bg-cyan-500/20 transition-all pointer-events-auto"
                aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        className="fixed inset-0 z-[240] bg-[#000103]/62 backdrop-blur-md p-10 md:p-24 flex flex-col justify-center border-b border-cyan-500/20 overflow-y-auto pointer-events-auto"
                    >
                        <nav className="max-w-5xl rounded-xl border border-cyan-500/20 bg-black/18 p-8 md:p-10 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter hover:text-cyan-400 hover:translate-x-4 transition-all mb-5 last:mb-0 block"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
