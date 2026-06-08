import { useMemo, useState, useRef, Suspense, useEffect, type PointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import {
    EffectComposer, Bloom, Noise, Vignette,
    ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import TacticalEarth from './canvas/TacticalEarth';
import HeroDrone from './canvas/HeroDrone';
import DataStreams from './canvas/DataStreams';
import { scrollState } from '../lib/scroll';
import { prefersReducedMotion, isCoarsePointer } from '../lib/device';

/*
 * GLOBE POSITION MATH — radius 9.0, horizon fill target ~45%
 * Raised to y=-6.0 to ensure the globe diameter fills mobile screens perfectly.
 */
const GLOBE_Y = -6.0;


const smootherstep = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
};

function CinematicCamera({ routeActive }: { routeActive: boolean }) {
    const lookTarget = useRef(new THREE.Vector3(0, 1.5, 0));
    const posCurrent = useRef(new THREE.Vector3(0, 0, 24));
    const rollCurrent = useRef(0);

    useFrame((state, delta) => {
        const k = Math.min(1, delta * 3.4); // frame-rate-independent lerp factor

        /*
         * SCROLL-DRIVEN CINEMATIC DIVE
         * ────────────────────────────
         * p = 0  → hero framing: drone top, logo middle, Earth at base (z=24).
         * p = 1  → camera has descended toward the planet and pushed in, the
         *          Earth's limb fills the lower frame (the "approach" shot).
         * Active-Theory-style: a single continuous, eased camera move tied to
         * the user's scroll position rather than fixed cuts.
         */
        const p = smootherstep(0, 1, scrollState.heroProgress);

        // Pointer parallax — subtle, so the frame feels alive even at rest.
        const px = state.pointer.x;
        const py = state.pointer.y;

        /*
         * CONTINUOUS "BREATHING" DRIFT
         * ────────────────────────────
         * A slow multi-frequency orbit so the cinematic frame is never frozen,
         * even before the user scrolls. Faded out as the dive begins (so it
         * doesn't fight the scroll move) and zeroed entirely under reduced motion.
         */
        const t = state.clock.elapsedTime;
        const breathAmt = prefersReducedMotion() ? 0 : (1 - p * 0.7);
        const breathX = (Math.sin(t * 0.12) * 0.55 + Math.sin(t * 0.27) * 0.18) * breathAmt;
        const breathY = (Math.cos(t * 0.10) * 0.38 + Math.sin(t * 0.33) * 0.12) * breathAmt;
        const breathZ = (Math.sin(t * 0.08) * 0.65) * breathAmt;
        const breathLookX = (Math.sin(t * 0.09) * 0.22) * breathAmt;
        const breathLookY = (Math.cos(t * 0.11) * 0.16) * breathAmt;

        /*
         * SOLAR-SYSTEM ZOOM-OUT (post-hero)
         * ─────────────────────────────────
         * `p` (heroProgress) drives the dive to Earth within the first viewport.
         * Beyond that, `cruise` (from whole-document progress) re-centres the
         * camera on the globe and pulls steadily back — so the Earth recedes to a
         * centred sphere ringed by its orbits and satellites, revealing more of
         * the system the further you scroll. Scroll-driven (not autonomous), so
         * it stays active under reduced motion.
         */
        const q = scrollState.progress;
        const cruise = smootherstep(0.08, 0.42, q);    // 0 during hero → 1 mid-page
        const driftX = Math.sin(q * Math.PI * 1.1) * 1.4;   // gentle lateral life

        const posYHero  = py * 0.6 - p * 5.6;          // descend onto Earth
        const posZHero  = 24 - p * 8.5;                // push toward the globe
        const lookYHero = 1.5 - p * 6.5;               // look drops onto Earth

        // Continuous pull-back: Earth shrinks toward frame centre as you scroll.
        const zoomOutZ = 27 + q * 30;                  // ~27 → ~57 across the page
        const posY  = THREE.MathUtils.lerp(posYHero, GLOBE_Y + 1.2, cruise);  // ~level with globe centre
        const posZ  = THREE.MathUtils.lerp(posZHero, zoomOutZ, cruise);
        const lookY = THREE.MathUtils.lerp(lookYHero, GLOBE_Y, cruise);       // look at globe centre → centred

        const normalPos = new THREE.Vector3(
            px * 0.8 + breathX + driftX * cruise,
            posY + breathY,
            posZ + breathZ,
        );
        const normalLook = new THREE.Vector3(
            px * 0.3 + breathLookX + driftX * 0.25 * cruise,
            lookY + breathLookY,
            0,
        );

        const focusPos  = new THREE.Vector3(1.8, -1.1, 15);
        const focusLook = new THREE.Vector3(0.6, -0.8, 0);

        const posTarget   = routeActive ? focusPos  : normalPos;
        const lookTarget_ = routeActive ? focusLook : normalLook;

        posCurrent.current.lerp(posTarget, routeActive ? k * 0.7 : k);
        lookTarget.current.lerp(lookTarget_, routeActive ? k * 0.7 : k);

        state.camera.position.copy(posCurrent.current);
        state.camera.lookAt(lookTarget.current);

        // Velocity-reactive banking — a faint cinematic roll while scrolling fast.
        const targetRoll = THREE.MathUtils.clamp(scrollState.velocity * 0.0016, -0.05, 0.05);
        rollCurrent.current = THREE.MathUtils.lerp(rollCurrent.current, targetRoll, k);
        state.camera.rotation.z += rollCurrent.current;
    });

    return null;
}

/**
 * RealisticStarField — premium deep-space starfield.
 * 70% density reduction from original 400.
 * Three depth layers for parallax depth.
 * Blue atmospheric glow + subtle nebula effect.
 * Realistic brightness variation — no uniform fake pattern.
 */
function RealisticStarField() {
    // Layer 1: distant background — faint, tiny, many
    const distantRef = useRef<THREE.Points>(null!);
    // Layer 2: mid-field — medium brightness
    const midRef     = useRef<THREE.Points>(null!);
    // Layer 3: foreground bright — few prominent stars
    const nearRef    = useRef<THREE.Points>(null!);

    // Build a star layer
    const makeLayer = useMemo(() => (count: number, rMin: number, rMax: number, baseSize: number, brightCutoff: number, dimOpacity: number) => {
        const posData  = new Float32Array(count * 3);
        const colData  = new Float32Array(count * 3);
        const sizeData = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = rMin + Math.random() * (rMax - rMin);

            posData[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            posData[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            posData[i * 3 + 2] = r * Math.cos(phi) - 80;

            // Stellar color distribution
            const rnd = Math.random();
            if (rnd < 0.68) {
                // Blue-white main sequence (most common)
                const w = dimOpacity * (0.80 + Math.random() * 0.20);
                colData[i * 3]     = w * 0.88;
                colData[i * 3 + 1] = w * 0.92;
                colData[i * 3 + 2] = w;
            } else if (rnd < 0.82) {
                // Pure white
                const w = dimOpacity * (0.75 + Math.random() * 0.25);
                colData[i * 3]     = w;
                colData[i * 3 + 1] = w;
                colData[i * 3 + 2] = w;
            } else if (rnd < 0.93) {
                // Warm yellow-white (G-type)
                const w = dimOpacity * (0.70 + Math.random() * 0.25);
                colData[i * 3]     = w;
                colData[i * 3 + 1] = w * 0.88;
                colData[i * 3 + 2] = w * 0.65;
            } else {
                // Faint blue (hot O/B type)
                const w = dimOpacity * (0.55 + Math.random() * 0.30);
                colData[i * 3]     = w * 0.60;
                colData[i * 3 + 1] = w * 0.80;
                colData[i * 3 + 2] = w;
            }

            // Size distribution: heavy bias toward tiny, few bright outliers
            const s = Math.random();
            if (s > brightCutoff) {
                sizeData[i] = baseSize * (2.8 + Math.random() * 1.4);
            } else if (s > brightCutoff * 0.6) {
                sizeData[i] = baseSize * (1.4 + Math.random() * 0.8);
            } else {
                sizeData[i] = baseSize * (0.4 + Math.random() * 0.7);
            }
        }
        return { positions: posData, colors: colData, sizes: sizeData };
    }, []);

    // 70% reduction: 400 → 120. Three depth layers.
    const distant = useMemo(() => makeLayer(320, 150, 260, 0.032, 0.97, 0.55), [makeLayer]);
    const mid     = useMemo(() => makeLayer(150, 100, 150, 0.055, 0.96, 0.75), [makeLayer]);
    const near    = useMemo(() => makeLayer(55,   70, 100, 0.090, 0.93, 1.00), [makeLayer]);

    // Differential rotation — depth parallax
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (distantRef.current) {
            distantRef.current.rotation.y = t * 0.0030;
            distantRef.current.rotation.x = Math.sin(t * 0.0015) * 0.004;
        }
        if (midRef.current) {
            midRef.current.rotation.y = t * 0.0018;
            midRef.current.rotation.x = Math.sin(t * 0.0012) * 0.003;
        }
        if (nearRef.current) {
            nearRef.current.rotation.y = t * 0.0008;
        }
    });

    return (
        <>
            {/* Distant layer */}
            <points ref={distantRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[distant.positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[distant.colors, 3]} />
                    <bufferAttribute attach="attributes-size"     args={[distant.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial size={0.16} sizeAttenuation vertexColors transparent opacity={0.70} depthWrite={false} toneMapped={false} />
            </points>

            {/* Mid-field layer */}
            <points ref={midRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[mid.positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[mid.colors, 3]} />
                    <bufferAttribute attach="attributes-size"     args={[mid.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial size={0.22} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} toneMapped={false} />
            </points>

            {/* Near bright layer */}
            <points ref={nearRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[near.positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[near.colors, 3]} />
                    <bufferAttribute attach="attributes-size"     args={[near.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial size={0.30} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} toneMapped={false} />
            </points>

            {/* Blue atmospheric nebula — deep-space premium glow */}
            <pointLight position={[-40, 30, -120]} intensity={8.0}  color="#061428" distance={220} />
            <pointLight position={[ 60, -20, -140]} intensity={5.0} color="#040e22" distance={180} />
            <pointLight position={[  0,  60, -100]} intensity={3.5} color="#030b1a" distance={160} />
        </>
    );
}

// Battery/performance: pause rendering when tab is not visible
function usePageVisibility() {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const handler = () => setVisible(!document.hidden);
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, []);
    return visible;
}

export default function Scene({
    routeActive,
    routeDefinition,
}: {
    routeActive: boolean;
    routeDefinition: {
        originLabel: string;
        origin: { lat: number; lon: number };
        destLabel: string;
        dest: { lat: number; lon: number };
    };
}) {
    const [pointer, setPointer] = useState(() => new THREE.Vector2(0, 0));
    const pageVisible = usePageVisibility();

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        setPointer(new THREE.Vector2(
            (event.clientX  / window.innerWidth  - 0.5) * 2,
            -(event.clientY / window.innerHeight - 0.5) * 2,
        ));
    };

    const dpr: [number, number] = [1, Math.min(
        typeof window !== 'undefined' ? window.devicePixelRatio : 1.5,
        1.5,
    )];

    return (
        <div className="fixed inset-0 z-0 bg-[#000103]" onPointerMove={handlePointerMove}>
            <Canvas
                gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
                dpr={dpr}
                shadows={false}
                frameloop={pageVisible ? 'always' : 'demand'}
            >
                <color attach="background" args={['#000103']} />
                <PerspectiveCamera makeDefault position={[0, 0, 24]} fov={52} />
                <CinematicCamera routeActive={routeActive} />

                {/* ── LIGHTING ─────────────────────────────────────────── */}
                {/* Ambient — very dim, deep space feel */}
                <ambientLight intensity={0.15} />
                {/* Key light: upper-left, cool white — primary illumination */}
                <directionalLight position={[-8, 16, 18]} intensity={2.0} color="#cce8ff" />
                {/* Fill light: right side — secondary bounce */}
                <directionalLight position={[12, 8, 14]} intensity={1.0} color="#b8d8f0" />
                {/* Rim light: behind from above — separation from bg */}
                <directionalLight position={[0, 20, -20]} intensity={0.6} color="#3070a0" />
                {/* Drone under-light: subtle cyan */}
                <pointLight position={[0, -2, 8]} intensity={0.5} color="#0ea5e9" />
                {/* Earth sun-side light */}
                <directionalLight position={[4, 12, 20]} intensity={1.6} color="#d0e8ff" />
                <directionalLight position={[0, 5, 8]}  intensity={1.1} color="#ffffff" />
                <spotLight
                    position={[-20, 40, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={2.8}
                    color="#0ea5e9"
                />

                {/* ── STARFIELD & NEBULA ────────────────────────────────── */}
                {/* Three-layer depth starfield + atmospheric nebula glow */}
                <RealisticStarField />

                {/* ── ENVIRONMENT REFLECTIONS ───────────────────────────── */}
                {/*
                 * Baked-once studio environment built from Lightformers (no HDR
                 * network fetch). Gives the drone's metal crisp cyan/white streaks
                 * to reflect — the single biggest material upgrade.
                 */}
                <Environment resolution={256} frames={1} background={false}>
                    <color attach="background" args={['#000103']} />
                    {/* Cool key streak, upper-left */}
                    <Lightformer intensity={1.5} color="#cfe6ff" position={[-5, 4, 3]} rotation={[0, Math.PI / 3, 0]} scale={[6, 3, 1]} />
                    {/* Cyan signature accent, right */}
                    <Lightformer intensity={1.2} color="#22d3ee" position={[6, 1, 2]} rotation={[0, -Math.PI / 3, 0]} scale={[5, 2, 1]} />
                    {/* Warm amber rim, low-right (nav-light hint) */}
                    <Lightformer intensity={0.6} color="#f59e0b" position={[3, -3, -2]} scale={[3, 1.5, 1]} />
                    {/* Soft top fill — gentle so metal doesn't blow out under bloom */}
                    <Lightformer intensity={0.35} color="#ffffff" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 8, 1]} />
                </Environment>

                {/* ── EARTH & DRONE ─────────────────────────────────────── */}
                <Suspense fallback={null}>
                    {/* Earth rendered first (behind drone) */}
                    <TacticalEarth
                        globeElevation={GLOBE_Y}
                        showNavigation={routeActive}
                        pointer={pointer}
                        routeDefinition={routeDefinition}
                    />
                    {/*
                     * Orbital data-streams — a GPU-animated shell of glowing
                     * points circling the Earth (differential rotation + twinkle,
                     * ~zero CPU). Gives the Earth's limb real depth and motion.
                     */}
                    <group position={[0, GLOBE_Y, 0]}>
                        <DataStreams count={isCoarsePointer() ? 650 : 1500} color="#3fd0ff" />
                    </group>
                    {/*
                     * Wide cosmic-dust field — a large, slow drifting particle
                     * volume centred on the space-cruise framing so the content
                     * backdrop is filled with floating motion, not empty black.
                     */}
                    <group position={[0, 3, -4]}>
                        <DataStreams
                            count={isCoarsePointer() ? 500 : 1100}
                            innerRadius={16}
                            outerRadius={44}
                            color="#6fb6ec"
                        />
                    </group>
                    {/* Drone rendered on top — GLTF with procedural fallback */}
                    <HeroDrone pointer={pointer} />
                </Suspense>

                {/* ── POST-PROCESSING ───────────────────────────────────── */}
                {/* Cinematic stack: bloom → DOF → chromatic aberration →
                    grain → vignette. Tuned together for an investor-grade look. */}
                <EffectComposer multisampling={2}>
                    <Bloom
                        luminanceThreshold={0.18}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                        intensity={0.62}
                        radius={0.62}
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.0007, 0.0007)}
                        radialModulation={false}
                        modulationOffset={0}
                    />
                    <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.05} />
                    <Vignette eskil={false} offset={0.12} darkness={0.96} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
