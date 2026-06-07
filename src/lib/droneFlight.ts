import * as THREE from 'three';
import { scrollState } from './scroll';

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
    // Multi-frequency hover: primary slow lift + secondary micro-corrections
    const altHold      = Math.sin(t * 0.28) * 0.055 + Math.sin(t * 0.71) * 0.018 + Math.cos(t * 1.35) * 0.008;
    const lateralDrift = Math.sin(t * 0.17) * 0.032 + Math.cos(t * 0.43) * 0.012;
    const depthShift   = Math.sin(t * 0.22) * 0.028;

    // Scroll exit: climb + bank away as the camera dives toward Earth
    const p = scrollState.heroProgress;
    const exitLift = p * 7.0;
    const exitPush = p * p * 5.0;

    group.position.x = 0.0 + lateralDrift + p * 1.4;
    group.position.y = baseY + altHold + exitLift;
    group.position.z = 2.5 + depthShift - exitPush;

    const cursorRoll  = pointer.x * 0.028;
    const cursorPitch = -pointer.y * 0.018;

    const autonomousPitch =
        Math.sin(t * 0.55) * 0.022 + Math.cos(t * 1.80) * 0.009 + Math.sin(t * 3.10) * 0.004;
    const autonomousRoll =
        Math.cos(t * 0.42) * 0.018 + Math.sin(t * 1.60) * 0.010 + Math.cos(t * 2.90) * 0.005;
    const autonomousYaw =
        Math.sin(t * 0.28) * 0.012 + Math.cos(t * 0.95) * 0.006;

    group.rotation.x = -0.04 + cursorPitch + autonomousPitch - p * 0.25;
    group.rotation.y = autonomousYaw + cursorRoll * 0.3 + p * 0.2;
    group.rotation.z = cursorRoll * 0.45 + autonomousRoll - p * 0.35;
}
