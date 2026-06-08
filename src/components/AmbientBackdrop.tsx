import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * AmbientBackdrop
 *
 * A living field behind the scrolled content so the page never collapses to
 * flat black once the user moves past the 3D hero. Deep blue-black gradient +
 * slow-drifting cyan/blue glow blooms + faint stars + a masked tactical grid.
 *
 * Sits at z-1 (above the fixed 3D <Scene> at z-0, below content at z-10) and
 * fades in just after the hero so the cinematic hero stays pure 3D. All motion
 * is GPU-composited CSS and is frozen under prefers-reduced-motion (handled by
 * the global media query in index.css).
 */
export default function AmbientBackdrop() {
    const { scrollYProgress } = useScroll();
    // Transparent over the hero, then ease in across the first ~1 viewport.
    const raw = useTransform(scrollYProgress, [0, 0.05, 0.16], [0, 0.85, 1]);
    const opacity = useSpring(raw, { stiffness: 80, damping: 26, mass: 0.6 });

    return (
        <motion.div className="ambient-backdrop" style={{ opacity }} aria-hidden>
            <div className="ambient-stars" />
            <div className="ambient-glow ambient-glow-1" />
            <div className="ambient-glow ambient-glow-2" />
            <div className="ambient-glow ambient-glow-3" />
        </motion.div>
    );
}
