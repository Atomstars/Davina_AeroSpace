import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type RouteInputState = {
  originLabel: string;
  originLat: string;
  originLon: string;
  destLabel: string;
  destLat: string;
  destLon: string;
};

type VigilanceHUDProps = {
  navOpen: boolean;
  routeActive: boolean;
  onNavClick: () => void;
  onLocate: () => void;
  onClose: () => void;
  onSubmitRoute: () => void;
  routeInputs: RouteInputState;
  setRouteInputs: Dispatch<SetStateAction<RouteInputState>>;
};

export default function VigilanceHUD({ navOpen, routeActive, onNavClick, onLocate, onClose, onSubmitRoute, routeInputs, setRouteInputs }: VigilanceHUDProps) {
    // 1. PERFORMANCE UPGRADE: 
    // useMotionValue tracks the mouse without causing React re-renders.
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // 2. PHYSICS UPGRADE:
    // useSpring adds physical mass and tension to the cursor so it glides smoothly.
    const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
    const smoothX = useSpring(cursorX, springConfig);
    const smoothY = useSpring(cursorY, springConfig);

    const [isClicking, setIsClicking] = useState(false);
    const [coords, setCoords] = useState({ x: '0000', y: '0000' });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX - 40); // Offset by half the width of the reticle
            cursorY.set(e.clientY - 40); 
            
            // Text updates can still use standard state, they are cheap to render
            setCoords({
                x: e.clientX.toString().padStart(4, '0'),
                y: e.clientY.toString().padStart(4, '0')
            });
        };
        
        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [cursorX, cursorY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden select-none">
            
            {/* THE PRECISION TARGETING RETICLE */}
            <motion.div
                className="absolute flex items-center justify-center"
                style={{
                    x: smoothX,
                    y: smoothY,
                    width: 80,
                    height: 80
                }}
                animate={{
                    scale: isClicking ? 0.8 : 1 // Snappy shrink on click
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
                {/* 1. Corner Brackets (The Locking Frame) - Now with a slow spin! */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                >
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                </motion.div>

                {/* 2. Center Aiming Cross */}
                <motion.div
                    animate={{ rotate: isClicking ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex items-center justify-center"
                >
                    <div className="absolute w-[1px] h-4 bg-cyan-300 opacity-70" />
                    <div className="absolute w-4 h-[1px] bg-cyan-300 opacity-70" />
                    <div className="absolute w-[3px] h-[3px] bg-cyan-100 rounded-full shadow-[0_0_10px_#22d3ee]" />
                </motion.div>

                {/* 3. Military Telemetry Line & Data */}
                <div className="absolute top-1/2 left-[120%] flex items-center">
                    <div className="w-10 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent opacity-50" />
                    
                    <div className="flex flex-col gap-[2px] border-l border-cyan-500/50 pl-2 py-1">
                        <span className="text-[9px] text-cyan-400 font-mono tracking-[0.2em] uppercase font-semibold drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">
                            AXIS_X <span className="text-white">{coords.x}</span>
                        </span>
                        <span className="text-[9px] text-cyan-400 font-mono tracking-[0.2em] uppercase font-semibold drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]">
                            AXIS_Y <span className="text-white">{coords.y}</span>
                        </span>
                        {isClicking && (
                            <span className="text-[9px] text-red-400 font-mono tracking-[0.2em] uppercase font-bold animate-pulse mt-0.5 drop-shadow-[0_0_4px_rgba(248,113,113,0.6)]">
                                TARGET_LOCK
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Static HUD Telemetry */}
            <div className="absolute top-44 left-10 flex flex-col gap-3 opacity-80 mix-blend-screen pointer-events-auto">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    <button
                        onClick={onNavClick}
                        className="text-[10px] font-mono text-cyan-400 font-black tracking-[0.3em] uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] hover:text-white transition-colors bg-black/30 px-3 py-2 rounded-full"
                    >
                        {navOpen ? 'NAV LINK ONLINE' : 'NAV LINK ACTIVE'}
                    </button>
                    {navOpen && (
                        <button
                            onClick={onClose}
                            className="text-[10px] font-mono text-white tracking-[0.3em] uppercase bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-full hover:bg-red-500/15 transition-colors"
                        >
                            Close Navigation
                        </button>
                    )}
                </div>
                <div className="w-48 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent opacity-50 mt-1" />
                <div className="text-[8px] font-mono text-cyan-100/70 uppercase tracking-widest mt-1">
                    {navOpen ? 'Status: Navigation overlay engaged' : 'Status: Encrypted_Line_089'}
                </div>

                {navOpen && (
                    <div className="mt-4 rounded-3xl border border-cyan-500/20 bg-black/80 p-4 text-[9px] text-cyan-100 font-mono leading-tight tracking-[0.18em] shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[8px] uppercase text-cyan-300 tracking-[0.35em]">Route controls</span>
                            <span className="text-[8px] uppercase text-white tracking-[0.25em]">{routeActive ? 'ACTIVE' : 'STANDBY'}</span>
                        </div>
                        <div className="grid gap-2 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={routeInputs.originLabel}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, originLabel: e.target.value }))}
                                    placeholder="Origin label"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                                <input
                                    value={routeInputs.destLabel}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, destLabel: e.target.value }))}
                                    placeholder="Destination label"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={routeInputs.originLat}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, originLat: e.target.value }))}
                                    placeholder="Origin lat"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                                <input
                                    value={routeInputs.originLon}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, originLon: e.target.value }))}
                                    placeholder="Origin lon"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={routeInputs.destLat}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, destLat: e.target.value }))}
                                    placeholder="Destination lat"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                                <input
                                    value={routeInputs.destLon}
                                    onChange={(e) => setRouteInputs((prev) => ({ ...prev, destLon: e.target.value }))}
                                    placeholder="Destination lon"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={onSubmitRoute}
                                className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-3 text-[10px] uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                            >
                                Launch custom navigation
                            </button>
                            <button
                                onClick={onLocate}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-[10px] uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-colors"
                            >
                                {routeActive ? 'Navigation visible on globe' : 'Locate coordinates on globe'}
                            </button>
                            <div className="text-[8px] uppercase tracking-[0.35em] text-cyan-400">
                                {routeActive ? 'Navigation route is now visible.' : 'Submit coordinates then locate to display route.'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}