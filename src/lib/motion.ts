import type { Variants, Transition } from 'framer-motion';

/*
 * ─────────────────────────────────────────────────────────────
 * DAVINA MOTION SYSTEM
 * One source of truth for easing, springs, and entrance variants.
 * Every section/card shares this rhythm so motion reads as one
 * orchestrated language rather than unrelated fades.
 *
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user">
 * (see main.tsx) — Framer strips transforms and keeps opacity automatically,
 * so these variants are safe to use everywhere without per-component guards.
 * ─────────────────────────────────────────────────────────────
 */

// ── Signature easing curves (cubic-bezier) ───────────────────
// Confident, weighted ease-out — nothing snaps, everything settles.
export const EASE_SIGNATURE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

// ── Named spring configs — physics with real weight ──────────
export const spring = {
    /** Primary entrance — soft settle with a touch of momentum. */
    soft: { type: 'spring', stiffness: 130, damping: 20, mass: 0.7 } as Transition,
    /** Interactive feedback (hover/press) — quick, tight. */
    snappy: { type: 'spring', stiffness: 320, damping: 26, mass: 0.5 } as Transition,
    /** Heavy, cinematic — large elements, hero. */
    gentle: { type: 'spring', stiffness: 90, damping: 18, mass: 0.9 } as Transition,
} as const;

// ── Reusable entrance variants ───────────────────────────────

/** Single element rising into place. Use with whileInView or animate. */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: spring.soft },
};

/** Subtle fade, no travel — for large blocks where motion should be quiet. */
export const fade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_SIGNATURE } },
};

/**
 * Stagger parent — orchestrates children entering in sequence.
 * Pair with `staggerItem` on each child.
 */
export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
};

/** Child of a staggerContainer. Same named states so the parent drives timing. */
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: spring.soft },
};

/** Hero content column — cinematic, slightly heavier settle. */
export const heroContent: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { ...spring.gentle, delay: 0.15 },
    },
};

// ── Shared viewport config for whileInView reveals ───────────
export const viewportOnce = { once: true, margin: '-60px' } as const;
