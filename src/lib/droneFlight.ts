import * as THREE from 'three';
import { scrollState } from './scroll';
import { prefersReducedMotion } from './device';

// Eased ramp (smootherstep) — gives the scroll exit acceleration/settle
// instead of a constant-rate slide.
const smootherstep = (x: number) => {
    const t = Math.min(1, Math.max(0, x));
    return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Shared hero-drone flight model.
 *
 * Applies the autonomous hover, IMU-style gyro corrections, cursor parallax,
 * and the scroll-driven "climb out of frame" exit to a drone group — so the
 * GLTF model and the procedural fallback move identically.
 *
 * Call once per frame from useFrame with the drone's group ref.
 */
export function applyDroneFlight(
    group: THREE.Group,
    t: number,
    pointer: THREE.Vector2,
    baseY = 9.6,
) {
    // Under reduced motion, suppress the idle oscillation so the craft sits calm.
    const idle = prefersReducedMotion() ? 0 : 1;

    // Multi-frequency hover: primary slow lift + secondary micro-corrections
    const altHold      = (Math.sin(t * 0.28) * 0.055 + Math.sin(t * 0.71) * 0.018 + Math.cos(t * 1.35) * 0.008) * idle;
    const lateralDrift = (Math.sin(t * 0.17) * 0.032 + Math.cos(t * 0.43) * 0.012) * idle;
    const depthShift   = (Math.sin(t * 0.22) * 0.028) * idle;

    /*
     * SCROLL EXIT — the drone belongs to the landing frame only.
     * As soon as the user scrolls it makes a clean straight climb up and out
     * of frame, then is hidden entirely for the content sections (where the
     * camera does a space cruise). No banking gymnastics — a calm ascent so it
     * never reads as a janky animated prop at an odd angle behind the content.
     */
    const p = scrollState.heroProgress;
    const e = smootherstep(p);
    const exitLift = e * 9.0;
    const exitPush = e * e * 2.0;

    // Hidden once the hero is essentially scrolled past (it's far out of frame
    // by this point, so the toggle is imperceptible).
    group.visible = p < 0.85;

    group.position.x = 0.0 + lateralDrift + e * 0.5;
    group.position.y = baseY + altHold + exitLift;
    group.position.z = 2.5 + depthShift - exitPush;

    const cursorRoll  = pointer.x * 0.028;
    const cursorPitch = -pointer.y * 0.018;

    const autonomousPitch =
        (Math.sin(t * 0.55) * 0.022 + Math.cos(t * 1.80) * 0.009 + Math.sin(t * 3.10) * 0.004) * idle;
    const autonomousRoll =
        (Math.cos(t * 0.42) * 0.018 + Math.sin(t * 1.60) * 0.010 + Math.cos(t * 2.90) * 0.005) * idle;
    const autonomousYaw =
        (Math.sin(t * 0.28) * 0.012 + Math.cos(t * 0.95) * 0.006) * idle;

    // Gentle nose-up as it climbs away; no roll/bank.
    group.rotation.x = -0.04 + cursorPitch + autonomousPitch - e * 0.18;
    group.rotation.y = autonomousYaw + cursorRoll * 0.3;
    group.rotation.z = cursorRoll * 0.45 + autonomousRoll;
}
