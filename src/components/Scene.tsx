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
    const lookTarget = useRef(new THREE.Vector3(0, 2.5, 0));

    useFrame((state, delta) => {
        /*
         * Camera at z=22, FOV 55°, looking at y=2.5.
         * This framing keeps the hero text in upper portion
         * and Earth horizon at bottom 35%.
         */
        const normalPos  = new THREE.Vector3(0, 0, 22);
        const normalLook = new THREE.Vector3(0, 2.5, 0);
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
 * RealisticStarField — a true deep-space starfield.
 * Thousands of small round points at varying distances.
 * References NASA/JWST imagery: varying brightness, no cubes/squares.
 * Stars are placed in a hemisphere behind the scene.
 */
function RealisticStarField() {
    const starsRef = useRef<THREE.Points>(null!);

    const { positions, colors, sizes } = useMemo(() => {
        const count = 400; // Drastically reduced for a cleaner, non-artificial look
        const posData  = new Float32Array(count * 3);
        const colData  = new Float32Array(count * 3);
        const sizeData = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spherical distribution — all behind scene (z < 0 bias)
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = 120 + Math.random() * 160;

            posData[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            posData[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            posData[i * 3 + 2] = r * Math.cos(phi) - 80; // push behind scene

            // Realistic star colors: 90% white/blue-white, 5% warm yellow, 5% cool blue
            const rnd = Math.random();
            if (rnd < 0.70) {
                // Main sequence: white / blue-white
                const b = 0.85 + Math.random() * 0.15;
                colData[i * 3]     = b - Math.random() * 0.08;
                colData[i * 3 + 1] = b - Math.random() * 0.04;
                colData[i * 3 + 2] = b;
            } else if (rnd < 0.85) {
                // Blue giant — cooler, slightly blue tinted
                colData[i * 3]     = 0.65 + Math.random() * 0.20;
                colData[i * 3 + 1] = 0.75 + Math.random() * 0.20;
                colData[i * 3 + 2] = 0.95 + Math.random() * 0.05;
            } else if (rnd < 0.95) {
                // Yellow-orange: K-type / G-type like the sun
                colData[i * 3]     = 0.95 + Math.random() * 0.05;
                colData[i * 3 + 1] = 0.80 + Math.random() * 0.15;
                colData[i * 3 + 2] = 0.50 + Math.random() * 0.20;
            } else {
                // Faint reddish — M-type dwarf or red giant
                colData[i * 3]     = 0.90 + Math.random() * 0.10;
                colData[i * 3 + 1] = 0.45 + Math.random() * 0.25;
                colData[i * 3 + 2] = 0.30 + Math.random() * 0.20;
            }

            // Size: most stars tiny, a few bright ones larger
            const sizeBias = Math.random();
            if (sizeBias > 0.98) {
                sizeData[i] = 0.22 + Math.random() * 0.18; // Bright star
            } else if (sizeBias > 0.90) {
                sizeData[i] = 0.10 + Math.random() * 0.10; // Medium star
            } else {
                sizeData[i] = 0.03 + Math.random() * 0.06; // Faint background star
            }
        }

        return { positions: posData, colors: colData, sizes: sizeData };
    }, []);

    // Very slow drift — deep space stillness
    useFrame((state) => {
        if (!starsRef.current) return;
        starsRef.current.rotation.y = state.clock.elapsedTime * 0.004;
        starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.005;
    });

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                sizeAttenuation
                vertexColors
                transparent
                opacity={0.92}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

/**
 * PerspectiveGrid — subtle aerospace tactical grid.
 * Placed at horizon level with strong perspective depth effect.
 * Low opacity so it supports the scene without dominating.
 */
function PerspectiveGrid() {
    const gridRef = useRef<THREE.Group>(null!);

    const { positions, colors } = useMemo(() => {
        const lines: number[] = [];
        const cols: number[]  = [];
        const gridSize = 80;
        const cellCount = 20;
        const step = gridSize / cellCount;
        const halfSize = gridSize / 2;

        // Horizontal lines (Z direction — into depth)
        for (let i = 0; i <= cellCount; i++) {
            const z = -halfSize + i * step;
            const isMajor = i % 5 === 0;
            const opacity = isMajor ? 0.35 : 0.12;
            
            // Tactical blue grid
            const r = 0.05 * (opacity / 0.12);
            const g = 0.65 * (opacity / 0.12);
            const b = 0.91 * (opacity / 0.12);

            lines.push(-halfSize, 0, z,  halfSize, 0, z);
            cols.push(r, g, b, r, g, b);
        }

        // Vertical lines (X direction — width)
        for (let i = 0; i <= cellCount; i++) {
            const x = -halfSize + i * step;
            const isMajor = i % 5 === 0;
            const opacity = isMajor ? 0.35 : 0.12;
            
            const r = 0.05 * (opacity / 0.12);
            const g = 0.65 * (opacity / 0.12);
            const b = 0.91 * (opacity / 0.12);

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
            // Opacity scales from 0.0 at top, fading in to 0.5 as user scrolls down
            const scrollY = window.scrollY;
            const targetOpacity = Math.min(0.5, (scrollY / 400) * 0.5);
            materialRef.current.opacity = targetOpacity;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Init
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <group ref={gridRef} position={[0, GLOBE_Y + 0.5, -10]} rotation={[0.12, 0, 0]}>
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
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
                <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={55} />
                <CinematicCamera routeActive={routeActive} />

                {/* ── LIGHTING ─────────────────────────────────────────── */}
                {/* Ambient — very dim, deep space feel */}
                <ambientLight intensity={0.18} />
                {/* Key light: upper-left, warm white — primary illumination */}
                <directionalLight position={[-8, 16, 18]} intensity={1.8} color="#d8eeff" />
                {/* Fill light: right side — secondary bounce */}
                <directionalLight position={[12, 8, 14]} intensity={0.9} color="#c8e0f0" />
                {/* Rim light: behind from above — separation from bg */}
                <directionalLight position={[0, 20, -20]} intensity={0.5} color="#4080a0" />
                {/* Drone under-light: subtle cyan */}
                <pointLight position={[0, -2, 8]} intensity={0.6} color="#0ea5e9" />
                {/* Earth sun-side light */}
                <directionalLight position={[4, 12, 20]} intensity={1.4} color="#dbeafe" />
                <directionalLight position={[0, 5, 8]}  intensity={1.0} color="#ffffff" />
                <spotLight
                    position={[-20, 40, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={2.4}
                    color="#0ea5e9"
                />

                {/* ── STARFIELD & NEBULA ────────────────────────────────── */}
                <RealisticStarField />
                {/* Subtle blue nebula deep space glow */}
                <pointLight position={[0, 10, -60]} intensity={1.5} color="#081028" distance={150} />

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
