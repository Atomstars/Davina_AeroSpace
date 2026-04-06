import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, UserPlus } from 'lucide-react';
import DavinaLogo from './DavinaLogo';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed top-8 left-10 z-[250] flex flex-col leading-none pointer-events-auto">
                <DavinaLogo />
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-8 right-10 z-[250] p-4 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-full text-white hover:bg-cyan-500/20 transition-all pointer-events-auto"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        className="fixed inset-0 z-[240] bg-[#000103]/98 backdrop-blur-2xl p-10 md:p-32 flex flex-col md:flex-row gap-20 border-b border-cyan-500/20 overflow-y-auto pointer-events-auto"
                    >
                        <div className="flex-1 flex flex-col justify-center border-r border-white/5 pr-10">
                            <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-12 italic">01 // OPERATIONS_HUB</span>
                            {['Avionics', 'Propulsion', 'Orbital_Systems', 'Defence_Net'].map((item) => (
                                <a key={item} href={`#${item}`} onClick={() => setIsOpen(false)}
                                    className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter hover:text-cyan-400 hover:translate-x-6 transition-all mb-6 block">
                                    {item}
                                </a>
                            ))}
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-12">
                            <span className="text-cyan-500 font-mono text-[10px] tracking-[1em] uppercase mb-4 italic">02 // SECURE_PORTAL</span>
                            <button className="flex items-center gap-6 text-2xl md:text-3xl font-bold hover:text-cyan-400 group w-fit">
                                <div className="p-4 border border-white/10 rounded-lg group-hover:border-cyan-500 bg-white/5"><Lock size={20} /></div> COMMAND_LOGIN
                            </button>
                            <button className="flex items-center gap-6 text-2xl md:text-3xl font-bold hover:text-cyan-400 group w-fit">
                                <div className="p-4 border border-white/10 rounded-lg group-hover:border-cyan-500 bg-white/5"><UserPlus size={20} /></div> ENLIST_NODE
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
