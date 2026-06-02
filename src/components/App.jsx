import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Scene from './components/Scene';
import Navbar from './components/Navbar';
import VigilanceHUD from './components/VigilanceHUD';
import { Target, Zap } from 'lucide-react';

export default function App() {
    const [isBooting, setIsBooting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full min-h-screen bg-black text-white font-sans cursor-none overflow-hidden select-none">
            {/* Subtle Tactical Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-40">
                <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <Scene />
            <VigilanceHUD />
            <Navbar />

            <AnimatePresence>
                {isBooting && (
                    <motion.div
                        exit={{ opacity: 0, filter: "blur(40px)" }}
                        className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-mono"
                    >
                        <div className="text-cyan-500 text-[10px] tracking-[3em] mb-4 uppercase italic">Vanguard_Uplink_Active</div>
                        <div className="w-80 h-[1px] bg-white/10 relative overflow-hidden">
                            <motion.div
                                initial={{ left: "-100%" }} animate={{ left: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 bg-cyan-400"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 w-full h-screen flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 1 }}
                    className="flex flex-col items-center text-center mt-[-10vh]" // Shifted up slightly to balance the globe
                >
                    <div className="flex items-center gap-8 mb-10 opacity-40">
                        <Target size={14} className="text-cyan-500" />
                        <span className="text-[10px] font-mono tracking-[1.5em] uppercase italic">Sector_01_Origin</span>
                        <Target size={14} className="text-cyan-500" />
                    </div>

                    {/* FIXED TYPOGRAPHY: Sized down, tracking fixed to prevent overlap */}
                    <h1 className="logo-font text-7xl md:text-[11rem] leading-[0.85] tracking-tight uppercase drop-shadow-[0_0_80px_rgba(34,211,238,0.2)]">
                        DAVINA
                    </h1>

                    <div className="flex flex-col items-center gap-6 mt-12 max-w-2xl">
                        <p className="text-cyan-400 font-mono tracking-[1.5em] text-[10px] md:text-xs uppercase font-black pl-6 opacity-60">
                            Engineering the Void
                        </p>
                        <p className="text-slate-400 text-sm md:text-base font-light italic mt-4 opacity-60 leading-relaxed px-10">
                            Orbital sovereignty and critical infrastructure defence.
                            Vanguard interceptor node currently holding GEO-Stationary lock.
                        </p>

                        <div className="flex items-center gap-3 opacity-40 mt-8 border border-white/10 px-6 py-2 rounded-full bg-white/5">
                            <Zap size={12} className="text-yellow-400 animate-pulse" />
                            <span className="text-[9px] font-mono tracking-[0.2em] uppercase">Click anywhere to deploy kinetic pulse</span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}