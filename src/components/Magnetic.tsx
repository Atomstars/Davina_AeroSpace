import { useRef } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { isCoarsePointer, prefersReducedMotion } from '../lib/device';

/**
 * Magnetic — wraps an interactive element so it's gently pulled toward the
 * cursor while hovered, then springs back on leave. Adds physical weight to
 * CTAs/nav without being gimmicky.
 *
 * Disabled on coarse-pointer (touch) devices and under reduced motion, where
 * it renders as a plain inline-flex wrapper with no movement.
 */
export default function Magnetic({
    children,
    className = '',
    strength = 0.35,
}: {
    children: ReactNode;
    className?: string;
    strength?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    // Tight, snappy spring so the pull feels responsive, not floaty.
    const sx = useSpring(x, { stiffness: 320, damping: 26, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 320, damping: 26, mass: 0.5 });

    const enabled = !isCoarsePointer() && !prefersReducedMotion();

    const handleMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!enabled || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const mx = e.clientX - (rect.left + rect.width / 2);
        const my = e.clientY - (rect.top + rect.height / 2);
        x.set(mx * strength);
        y.set(my * strength);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            // Display is controlled by the caller's className (e.g. "inline-flex"
            // or "hidden lg:inline-flex") so responsive visibility is preserved.
            className={className}
            style={{ x: sx, y: sy }}
            onMouseMove={handleMove}
            onMouseLeave={reset}
        >
            {children}
        </motion.div>
    );
}
