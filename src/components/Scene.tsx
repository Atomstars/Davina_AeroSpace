import { useMemo, useState, useRef, Suspense, useEffect, type PointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import TacticalEarth from './canvas/TacticalEarth';
import MorphingHeroDrone from './canvas/MorphingHeroDrone';

/*
 * GLOBE POSITION MATH — radius 9.0, horizon fill target ~45%
 * Raised to y=-6.0 to ensure the globe diameter fills mobile screens perfectly.
 */
const GLOBE_Y = -6.0;


function CinematicCamera({ routeActive }: { routeActive: boolean }) {
    const lookTarget = useRef(new THREE.Vector3(0, 1.5, 0));

    useFrame((state, delta) => {
        /*
         * Camera at z=24 (pulled back slightly to frame drone above logo).
         * FOV 52° — tighter framing, less distortion.
         * Looking at y=1.5: centres frame between drone (top) and Earth (bottom).
         * This ensures: drone visible at top, logo/headline middle, Earth at base.
         */
        const normalPos  = new THREE.Vector3(0, 0, 24);
        const normalLook = new THREE.Vector3(0, 1.5, 0);
        const focusPos   = new THREE.Vector3(1.8, -1.1, 15);
        const focusLook  = new THREE.Vector3(0.6, -0.8, 0);

        const posTarget   = routeActive ? focusPos  : normalPos;
        const lookTarget_ = routeActive ? focusLook : normalLook;

        state.camera.position.lerp(posTarget, (routeActive ? 2.2 : 2) * delta);
        lookTarget.current.lerp(lookTarget_, (routeActive ? 2.2 : 2) * delta);
        state.camera.lookAt(lookTarget.current);
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
    const distant = useMemo(() => makeLayer(70,  150, 260, 0.032, 0.97, 0.55), [makeLayer]);
    const mid     = useMemo(() => makeLayer(35,  100, 150, 0.055, 0.96, 0.75), [makeLayer]);
    const near    = useMemo(() => makeLayer(15,   70, 100, 0.090, 0.93, 1.00), [makeLayer]);

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
                <pointsMaterial size={0.10} sizeAttenuation vertexColors transparent opacity={0.70} depthWrite={false} toneMapped={false} />
            </points>

            {/* Mid-field layer */}
            <points ref={midRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[mid.positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[mid.colors, 3]} />
                    <bufferAttribute attach="attributes-size"     args={[mid.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial size={0.10} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} toneMapped={false} />
            </points>

            {/* Near bright layer */}
            <points ref={nearRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[near.positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[near.colors, 3]} />
                    <bufferAttribute attach="attributes-size"     args={[near.sizes, 1]} />
                </bufferGeometry>
                <pointsMaterial size={0.10} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} toneMapped={false} />
            </points>

            {/* Blue atmospheric nebula — deep-space premium glow */}
            <pointLight position={[-40, 30, -120]} intensity={8.0}  color="#061428" distance={220} />
            <pointLight position={[ 60, -20, -140]} intensity={5.0} color="#040e22" distance={180} />
            <pointLight position={[  0,  60, -100]} intensity={3.5} color="#030b1a" distance={160} />
        </>
    );
}

/**
 * PerspectiveGrid — subtle aerospace tactical grid.
 * Reduced opacity and line weight — supports Earth, never competes with content.
 * Fades toward horizon via vertex color gradient.
 */
function PerspectiveGrid() {
    const gridRef = useRef<THREE.Group>(null!);

    const { positions, colors } = useMemo(() => {
        const lines: number[] = [];
        const cols: number[]  = [];
        const gridSize  = 80;
        const cellCount = 20;
        const step      = gridSize / cellCount;
        const halfSize  = gridSize / 2;

        // Cyan grid — much lower opacity than before
        const majorR = 0.03, majorG = 0.48, majorB = 0.72;
        const minorR = 0.02, minorG = 0.24, minorB = 0.40;

        // Horizontal lines (Z depth) — fade from bright (near) to invisible (far)
        for (let i = 0; i <= cellCount; i++) {
            const z       = -halfSize + i * step;
            const isMajor = i % 5 === 0;
            // Horizon fade: near (z close to 0) = brighter, far = dimmer
            const distFade = 1.0 - Math.abs(z / halfSize) * 0.88;
            const r = (isMajor ? majorR : minorR) * distFade;
            const g = (isMajor ? majorG : minorG) * distFade;
            const b = (isMajor ? majorB : minorB) * distFade;

            lines.push(-halfSize, 0, z,  halfSize, 0, z);
            cols.push(r, g, b, r, g, b);
        }

        // Vertical lines (X width) — fade from center to edges
        for (let i = 0; i <= cellCount; i++) {
            const x       = -halfSize + i * step;
            const isMajor = i % 5 === 0;
            // Edge fade: center = brighter, edges = dimmer
            const edgeFade = 1.0 - Math.abs(x / halfSize) * 0.82;
            const r = (isMajor ? majorR : minorR) * edgeFade;
            const g = (isMajor ? majorG : minorG) * edgeFade;
            const b = (isMajor ? majorB : minorB) * edgeFade;

            lines.push(x, 0, -halfSize,  x, 0, halfSize);
            cols.push(r, g, b, r, g, b);
        }

        return {
            positions: new Float32Array(lines),
            colors:    new Float32Array(cols),
        };
    }, []);

    const materialRef = useRef<THREE.LineBasicMaterial>(null!);

    useEffect(() => {
        const handleScroll = () => {
            if (!materialRef.current) return;
            // Max opacity 0.30 (was 0.5) — grid supports, never dominates
            const targetOpacity = Math.min(0.30, (window.scrollY / 400) * 0.30);
            materialRef.current.opacity = targetOpacity;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <group ref={gridRef} position={[0, GLOBE_Y + 0.5, -10]} rotation={[0.12, 0, 0]}>
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
                </bufferGeometry>
                <lineBasicMaterial ref={materialRef} vertexColors transparent opacity={0.0} depthWrite={false} toneMapped={false} />
            </lineSegments>
        </group>
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

                {/* ── PERSPECTIVE GRID ──────────────────────────────────── */}
                {/* Subtle tactical aerospace grid — supports scene, doesn't dominate */}
                <PerspectiveGrid />

                {/* ── EARTH & DRONE ─────────────────────────────────────── */}
                <Suspense fallback={null}>
                    {/* Earth rendered first (behind drone) */}
                    <TacticalEarth
                        globeElevation={GLOBE_Y}
                        showNavigation={routeActive}
                        pointer={pointer}
                        routeDefinition={routeDefinition}
                    />
                    {/* Drone rendered on top */}
                    <MorphingHeroDrone pointer={pointer} />
                </Suspense>

                {/* ── POST-PROCESSING ───────────────────────────────────── */}
                <EffectComposer multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.22}
                        mipmapBlur
                        intensity={0.38}
                        radius={0.28}
                    />
                    <Noise opacity={0.014} />
                    <Vignette eskil={false} offset={0.08} darkness={0.92} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
