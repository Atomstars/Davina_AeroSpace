import { useMemo, useState, useRef, Suspense, type PointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';

import TacticalEarth from './canvas/TacticalEarth';
import MorphingHeroDrone from './canvas/MorphingHeroDrone';

function CinematicCamera({ routeActive }: { routeActive: boolean }) {
    const lookTarget = useRef(new THREE.Vector3(0, 2, 0));

    useFrame((state, delta) => {
        const normalPos = new THREE.Vector3(0, 0, 18);
        const normalLook = new THREE.Vector3(0, 2, 0);
        const focusPos = new THREE.Vector3(1.8, -1.1, 12);
        const focusLook = new THREE.Vector3(0.6, -0.8, 0);

        const posTarget = routeActive ? focusPos : normalPos;
        const lookPosTarget = routeActive ? focusLook : normalLook;

        state.camera.position.lerp(posTarget, (routeActive ? 2.2 : 2) * delta);
        lookTarget.current.lerp(lookPosTarget, (routeActive ? 2.2 : 2) * delta);
        state.camera.lookAt(lookTarget.current);
    });

    return null;
}

function TwinkleField() {
    const pointsRef = useRef<THREE.Points>(null!);
    const materialRef = useRef<THREE.PointsMaterial>(null!);

    const positions = useMemo(() => {
        const count = 620;
        const data = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 1) {
            const radius = 45 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
            data[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            data[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            data[i * 3 + 2] = -Math.abs(radius * Math.cos(phi)) - 8;
        }

        return data;
    }, []);

    useFrame((state) => {
        if (!materialRef.current || !pointsRef.current) return;
        const pulse = 0.42 + Math.sin(state.clock.elapsedTime * 2.8) * 0.12 + Math.sin(state.clock.elapsedTime * 6.4) * 0.08;
        materialRef.current.opacity = THREE.MathUtils.clamp(pulse, 0.2, 0.64);
        pointsRef.current.rotation.y += 0.0004;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                color="#dff9ff"
                size={0.11}
                sizeAttenuation
                transparent
                opacity={0.42}
                depthWrite={false}
                toneMapped={false}
            />
        </points>
    );
}

export default function Scene({ routeActive, routeDefinition }: { routeActive: boolean; routeDefinition: { originLabel: string; origin: { lat: number; lon: number }; destLabel: string; dest: { lat: number; lon: number } } }) {
    const [pointer, setPointer] = useState(() => new THREE.Vector2(0, 0));
    
    const GLOBE_Y = -4.5;

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        setPointer(new THREE.Vector2(
            (event.clientX / window.innerWidth - 0.5) * 2,
            -(event.clientY / window.innerHeight - 0.5) * 2
        ));
    };

    return (
        <div className="fixed inset-0 z-0 bg-[#000103]" onPointerMove={handlePointerMove}>
            <Canvas
                gl={{
                    antialias: true,
                    powerPreference: "high-performance",
                    alpha: false,
                }}
                dpr={[1, 1.35]}
                shadows={false}
            >
                <color attach="background" args={['#000103']} />
                <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />

                <CinematicCamera routeActive={routeActive} />

                <ambientLight intensity={0.34} />
                <pointLight position={[20, 20, 20]} intensity={1.35} color="#ffffff" />
                <directionalLight position={[4, 12, 20]} intensity={1.65} color="#dbeafe" />
                <directionalLight position={[0, 5, 8]} intensity={1.55} color="#ffffff" />
                
                <spotLight
                    position={[-20, 40, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={3.4}
                    color="#0ea5e9"
                />
                <directionalLight position={[0, -10, 0]} intensity={0.35} color="#075985" />

                <Grid
                    position={[0, GLOBE_Y, 0]}
                    args={[150, 150]}
                    cellSize={1}
                    cellThickness={1}
                    cellColor="#0ea5e9"
                    sectionSize={5}
                    sectionThickness={1.5}
                    sectionColor="#22d3ee"
                    fadeDistance={50}
                    fadeStrength={2}
                    infiniteGrid
                />

                <Stars radius={200} depth={120} count={6000} factor={5.2} saturation={0.8} fade speed={1.05} />
                <TwinkleField />

                <Suspense fallback={null}>
                    <MorphingHeroDrone />
                    <TacticalEarth globeElevation={GLOBE_Y} showNavigation={routeActive} pointer={pointer} routeDefinition={routeDefinition} />
                </Suspense>

                <EffectComposer multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.22}
                        mipmapBlur
                        intensity={0.48}
                        radius={0.28}
                    />
                    <Noise opacity={0.025} />
                    <Vignette eskil={false} offset={0.13} darkness={1.32} />
                    <Scanline opacity={0.04} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
