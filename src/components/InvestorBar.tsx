import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';

export default function InvestorBar() {
    const [dismissed, setDismissed] = useState(false);

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ opacity: 0, y: -32 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -32 }}
                    transition={{ delay: 2.2, duration: 0.4, ease: 'easeOut' }}
                    className="fixed top-0 left-0 right-0 z-[300] investor-strip pointer-events-auto"
                >
                    <div className="max-w-[1440px] mx-auto px-4 h-9 flex items-center justify-center gap-3 relative">
                        {/* Flag + message */}
                        <span className="text-[0.6rem] font-mono tracking-[0.15em] uppercase text-amber-300/80 hidden sm:block">
                            🇮🇳 India's Next-Generation Defence Aerospace Platform
                        </span>
                        <span className="text-amber-500/40 hidden sm:block">·</span>
                        <a
                            href="#contact"
                            className="flex items-center gap-1 text-[0.6rem] font-mono tracking-[0.15em] uppercase text-amber-300 hover:text-amber-200 transition-colors"
                        >
                            Contact for Investor Briefing
                            <ArrowUpRight size={10} strokeWidth={2.5} />
                        </a>

                        {/* Dismiss */}
                        <button
                            onClick={() => setDismissed(true)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                            aria-label="Dismiss investor banner"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
