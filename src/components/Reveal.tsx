import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, viewportOnce } from '../lib/motion';

/**
 * Reveal — single source of truth for "enter on scroll" headers/blocks.
 *
 * Replaces the old CSS `.reveal` + IntersectionObserver mechanism so every
 * reveal on the page shares the motion system's spring + viewport config.
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user">.
 */
export default function Reveal({
    children,
    className = '',
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={className}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={delay ? { delay } : undefined}
        >
            {children}
        </motion.div>
    );
}
