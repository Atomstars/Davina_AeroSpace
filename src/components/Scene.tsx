import { useState, useRef, Suspense, type PointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Grid, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';

import TacticalEarth from './canvas/TacticalEarth';
import VanguardDrone from './canvas/VanguardDrone';
import KineticStrike from './canvas/KineticStrike';

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

export default function Scene({ routeActive, routeDefinition }: { routeActive: boolean; routeDefinition: { originLabel: string; origin: { lat: number; lon: number }; destLabel: string; dest: { lat: number; lon: number } } }) {
    const [strikes, setStrikes] = useState<{ id: number, start: THREE.Vector3, target: THREE.Vector3 }[]>([]);
    const [pointer, setPointer] = useState(() => new THREE.Vector2(0, 0));
    
    const GLOBE_Y = -4.5;

    const handleFire = (startPos: THREE.Vector3, targetPos: THREE.Vector3) => {
        const id = Date.now();
        setStrikes(prev => [...prev, { id, start: startPos.clone(), target: targetPos.clone() }]);
        setTimeout(() => setStrikes(prev => prev.filter(s => s.id !== id)), 950);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        setPointer(new THREE.Vector2(
            (event.clientX / window.innerWidth - 0.5) * 2,
            -(event.clientY / window.innerHeight - 0.5) * 2
        ));
    };

    return (
        <div className="fixed inset-0 z-0 bg-[#000103] cursor-none" onPointerMove={handlePointerMove}>
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

                <ambientLight intensity={0.78} />
                <pointLight position={[20, 20, 20]} intensity={3.2} color="#ffffff" />
                <directionalLight position={[4, 12, 20]} intensity={3.15} color="#dbeafe" />
                
                <spotLight
                    position={[-20, 40, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={7.2}
                    color="#0ea5e9"
                />
                <directionalLight position={[0, -10, 0]} intensity={0.65} color="#075985" />

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

                <Stars radius={170} depth={90} count={3800} factor={5.8} saturation={0} fade speed={0.1} />

                <Suspense fallback={null}>
                    <TacticalEarth globeElevation={GLOBE_Y} showNavigation={routeActive} pointer={pointer} routeDefinition={routeDefinition} />

                    {/* Static drone at left corner */}
                    <Float speed={0.55} rotationIntensity={0.04} floatIntensity={0.05}>
                        <VanguardDrone
                            initialPosition={[-6.45, -1.32, 2.62]}
                            droneScale={0.92}
                            isDynamic={false}
                            lookTarget="earth"
                            showRadar={true}
                            laserToEarth={true}
                            freezeHover={true}
                        />
                    </Float>

                    {/* Dynamic drone on top-back side of Earth (cursor-controlled) */}
                    <Float speed={0.8} rotationIntensity={0.12} floatIntensity={0.08}>
                        <VanguardDrone
                            initialPosition={[0, 6.8, -2.35]}
                            droneScale={2.25}
                            onFire={handleFire}
                            isDynamic={true}
                            lookTarget="user"
                            dynamicRange={2.5}
                            dynamicHeight={6.8}
                        />
                    </Float>

                    {/* Renders the kinetic strikes when you click */}
                    {strikes.map(s => (
                        <KineticStrike key={s.id} startPos={s.start} targetPos={s.target} />
                    ))}
                </Suspense>

                <EffectComposer multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.22}
                        mipmapBlur
                        intensity={1.35}
                        radius={0.46}
                    />
                    <Noise opacity={0.03} />
                    <Vignette eskil={false} offset={0.1} darkness={1.2} />
                    <Scanline opacity={0.04} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}