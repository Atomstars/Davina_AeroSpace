/*
 * Lightweight environment helpers shared across the 3D scene and DOM
 * micro-interactions. Computed lazily and cached — safe to call in hot paths
 * (e.g. useFrame) since they read a cached boolean after first evaluation.
 *
 * These are intentionally NOT React hooks so the r3f render loop and plain
 * event handlers can consume them without re-renders.
 */

let _reduced: boolean | null = null;
let _coarse: boolean | null = null;

/** True when the OS requests reduced motion. Re-reads on demand if unset. */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    if (_reduced === null) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        _reduced = mq.matches;
        // Keep the cached value honest if the user flips the setting live.
        mq.addEventListener?.('change', (e) => { _reduced = e.matches; });
    }
    return _reduced;
}

/** True on touch / coarse-pointer devices (drives mobile degradation). */
export function isCoarsePointer(): boolean {
    if (typeof window === 'undefined') return false;
    if (_coarse === null) {
        _coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    }
    return _coarse;
}
