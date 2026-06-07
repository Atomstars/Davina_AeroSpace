import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Shared scroll state — a plain mutable object so the r3f render loop
 * (useFrame) can read live scroll without triggering React re-renders.
 *
 *  - scrollY:       raw pixels from top
 *  - progress:      0..1 across the WHOLE document (for global effects)
 *  - heroProgress:  0..1 across the FIRST viewport height (drives the
 *                   cinematic hero camera dive)
 *  - velocity:      Lenis scroll velocity (px/frame-ish) for motion blur / tilt
 */
export const scrollState = {
    scrollY: 0,
    progress: 0,
    heroProgress: 0,
    velocity: 0,
};

let lenis: Lenis | null = null;

export function getLenis() {
    return lenis;
}

/**
 * Initialise Lenis smooth scrolling once, drive its RAF loop, and keep
 * `scrollState` updated every frame. Native scroll position is still set by
 * Lenis, so IntersectionObserver + framer-motion `whileInView` keep working.
 */
export function useSmoothScroll() {
    useEffect(() => {
        const instance = new Lenis({
            duration: 1.15,
            // gentle, premium ease-out — long tail like Active Theory
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.4,
        });
        lenis = instance;

        const update = ({ scroll, velocity }: { scroll: number; velocity: number }) => {
            const vh = window.innerHeight || 1;
            const docScrollable = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight,
            );
            scrollState.scrollY = scroll;
            scrollState.velocity = velocity;
            scrollState.progress = Math.min(1, Math.max(0, scroll / docScrollable));
            scrollState.heroProgress = Math.min(1, Math.max(0, scroll / vh));
        };

        instance.on('scroll', update);

        let rafId = 0;
        const raf = (time: number) => {
            instance.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        // Prime initial values
        update({ scroll: window.scrollY, velocity: 0 });

        return () => {
            cancelAnimationFrame(rafId);
            instance.destroy();
            lenis = null;
        };
    }, []);
}
