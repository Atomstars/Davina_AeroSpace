import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface TacticalEarthProps {
    globeElevation?: number;
    showNavigation?: boolean;
    pointer?: THREE.Vector2;
    routeDefinition?: {
        originLabel: string;
        origin: { lat: number; lon: number };
        destLabel: string;
        dest: { lat: number; lon: number };
    };
}

export default function TacticalEarth({ globeElevation = -4.5, showNavigation = false, pointer, routeDefinition }: TacticalEarthProps) {
    const earthRef = useRef<THREE.Mesh>(null!);
    const cloudsRef = useRef<THREE.Mesh>(null!);
    const atmosphereRef = useRef<THREE.Mesh>(null!);
    const ringsRef = useRef<THREE.Group>(null!);
    const globeGroupRef = useRef<THREE.Group>(null!);
    const navMarkerRef = useRef<THREE.Mesh>(null!);
    const navMarkerHaloRef = useRef<THREE.Mesh>(null!);
    const navProgress = useRef(0);
    const gyroPhase = useRef(0);
    const targetTilt = useRef(new THREE.Vector2(0.18, 0));
    const currentTilt = useRef(new THREE.Vector2(0.18, 0));
    const dragStart = useRef(new THREE.Vector2(0, 0));
    const dragOffset = useRef(new THREE.Vector2(0, 0));
    const isDragging = useRef(false);
    const navPulse = useRef(0);

    // 1. Load the realistic Earth textures you liked
    const [rawDayMap, rawNightMap, rawCloudsMap, rawBumpMap] = useTexture([
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        'https://unpkg.com/three-globe/example/img/earth-night.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
        'https://unpkg.com/three-globe/example/img/earth-topology.png'
    ]);

    // 2. Clone safely for the linter
    const { nightMap, cloudsMap, bumpMap } = useMemo(() => {
        const night = rawNightMap.clone();
        night.colorSpace = THREE.SRGBColorSpace;
        night.anisotropy = 16;
        night.needsUpdate = true;

        const clouds = rawCloudsMap.clone();
        clouds.anisotropy = 16;
        clouds.needsUpdate = true;

        const bump = rawBumpMap.clone();
        bump.anisotropy = 16;
        bump.needsUpdate = true;

        // Apply SRGB to day map for accurate color reproduction
        rawDayMap.colorSpace = THREE.SRGBColorSpace;
        rawDayMap.anisotropy = 16;
        rawDayMap.needsUpdate = true;

        return { nightMap: night, cloudsMap: clouds, bumpMap: bump };
    }, [rawDayMap, rawNightMap, rawCloudsMap, rawBumpMap]);

    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    };

    const navRoute = useMemo(() => {
        const radius = 6.52;
        const originLat = routeDefinition?.origin.lat ?? 20;
        const originLon = routeDefinition?.origin.lon ?? 78;
        const destLat = routeDefinition?.dest.lat ?? -25;
        const destLon = routeDefinition?.dest.lon ?? 133;

        const originPoint = latLonToVector3(originLat, originLon, radius);
        const destPoint = latLonToVector3(destLat, destLon, radius);
        const points: THREE.Vector3[] = [];
        const segments = 100;

        for (let i = 0; i <= segments; i += 1) {
            const t = i / segments;
            const point = originPoint.clone().lerp(destPoint, t).normalize().multiplyScalar(radius + 0.08);
            points.push(point);
        }

        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.85);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
        const material = new THREE.LineBasicMaterial({ color: 0x7de2ff, transparent: true, opacity: 0.7, toneMapped: false, depthTest: false });
        const line = new THREE.Line(geometry, material);
        line.renderOrder = 150;

        return { curve, line, originPoint, destPoint };
    }, [routeDefinition]);

    useFrame((_, delta) => {
        const currentPointer = pointer ?? new THREE.Vector2(0, 0);
        /*
         * Cursor-responsive gyroscopic tilt: max 3.1° (0.055 rad).
         * Satisfies requirement: "3°–5° maximum, no dramatic motion."
         * Feels like mission-control display subtly tracking the operator.
         */
        const hoverTilt = new THREE.Vector2(0.18 + currentPointer.y * 0.055, currentPointer.x * 0.055);
        const dragTilt = new THREE.Vector2(dragOffset.current.y * 0.8, dragOffset.current.x * 0.9);
        const baseTilt = isDragging.current ? new THREE.Vector2(0.18, 0).add(dragTilt) : hoverTilt;

        targetTilt.current.lerp(baseTilt, Math.min(delta * 4.6, 1));
        currentTilt.current.lerp(targetTilt.current, Math.min(delta * 7.2, 1));

        if (globeGroupRef.current) {
            gyroPhase.current += delta * 0.85;
            // Slowed from 0.03 → 0.015: mission-control gyroscopic rotation, not showcase animation
            globeGroupRef.current.rotation.y += delta * (showNavigation ? 0.005 : 0.015);
            // Reduced wobble amplitude 0.03 → 0.015: authoritative slow gyro movement
            globeGroupRef.current.rotation.x = currentTilt.current.x + Math.sin(gyroPhase.current) * (showNavigation ? 0.008 : 0.015);
            globeGroupRef.current.rotation.z = currentTilt.current.y + Math.sin(gyroPhase.current * 0.55) * (showNavigation ? 0.008 : 0.015);
        }
        
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.03;
            cloudsRef.current.rotation.x += delta * 0.002; 
        }

        if (ringsRef.current) {
            ringsRef.current.rotation.y -= delta * 0.02;
            ringsRef.current.rotation.z += delta * 0.01;
        }

        // satelliteOrbitRefs logic removed

        navProgress.current = (navProgress.current + delta * 0.017) % 1;
        const navPoint = navRoute.curve.getPointAt(navProgress.current);
        const navTangent = navRoute.curve.getTangentAt(navProgress.current);

        if (showNavigation && navMarkerRef.current) {
            navMarkerRef.current.position.copy(navPoint);
            navMarkerRef.current.lookAt(navPoint.clone().add(navTangent));
            navPulse.current += delta * 7.5;
            const markerScale = 1 + Math.sin(navPulse.current) * 0.18;
            navMarkerRef.current.scale.setScalar(markerScale);
        }

        if (showNavigation && navMarkerHaloRef.current) {
            const haloScale = 1.4 + Math.sin(navPulse.current * 0.7) * 0.32;
            navMarkerHaloRef.current.scale.setScalar(haloScale);
        }
    });

    return (
        <group
            ref={globeGroupRef}
            position={[0, globeElevation, 0]}
            rotation={[0.18, 0, 0]}
            onPointerDown={(e) => {
                e.stopPropagation();
                isDragging.current = true;
                dragStart.current.set(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
                if (!isDragging.current) return;
                dragOffset.current.set(
                    (e.clientX - dragStart.current.x) / window.innerWidth,
                    (e.clientY - dragStart.current.y) / window.innerHeight
                );
                dragOffset.current.clamp(new THREE.Vector2(-1, -1), new THREE.Vector2(1, 1));
            }}
            onPointerUp={(e) => {
                e.stopPropagation();
                isDragging.current = false;
                dragOffset.current.set(0, 0);
            }}
            onPointerLeave={() => {
                isDragging.current = false;
                dragOffset.current.set(0, 0);
            }}
        >

            {/* REALISTIC EARTH BASE — radius 9.0, increased day-side illumination */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[9.0, 64, 64]} />
                <meshStandardMaterial
                    color="#030f1e"
                    map={rawDayMap}
                    emissiveMap={nightMap}
                    emissive={new THREE.Color("#0a6090")}
                    emissiveIntensity={1.8}
                    bumpMap={bumpMap}
                    bumpScale={0.45}
                    roughness={0.65}
                    metalness={0.04}
                />
            </mesh>

            {/*
             * GEODESIC WIREFRAME OVERLAY — reduced opacity, secondary detail only
             */}
            <mesh>
                <icosahedronGeometry args={[9.07, 3]} />
                <meshBasicMaterial
                    color="#22d3ee"
                    wireframe
                    transparent
                    opacity={0.022}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>

            {/* CLOUDS LAYER — more visible, organic movement */}
            <mesh ref={cloudsRef} rotation={[0.2, 0, 0]}>
                <sphereGeometry args={[9.08, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.52}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* ATMOSPHERIC HALO — primary glow, strong blue horizon */}
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[9.38, 64, 64]} />
                <meshBasicMaterial
                    color="#1a90d0"
                    transparent
                    opacity={0.22}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Secondary atmosphere — broader scatter */}
            <mesh>
                <sphereGeometry args={[9.68, 48, 48]} />
                <meshBasicMaterial
                    color="#0a5a90"
                    transparent
                    opacity={0.10}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Outer limb glow — separates Earth from deep space */}
            <mesh>
                <sphereGeometry args={[9.95, 48, 48]} />
                <meshBasicMaterial
                    color="#042844"
                    transparent
                    opacity={0.055}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* ORBITAL PATHS — max 3, sit behind logo/headline/content.
                Interact only with Earth and Drone. */}
            <group ref={ringsRef} position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
                {/* Orbit 1 — primary ISR orbit, inner */}
                <group rotation={[Math.PI / 2.1, 0, 0]}>
                    <mesh>
                        <torusGeometry args={[10.5, 0.012, 16, 100]} />
                        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.28} />
                    </mesh>
                    <mesh position={[10.5, 0, 0]}>
                        <sphereGeometry args={[0.06, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" />
                        <pointLight color="#0ea5e9" intensity={0.7} distance={1.5} />
                    </mesh>
                </group>

                {/* Orbit 2 — higher inclined orbit */}
                <group rotation={[Math.PI / 1.8, 0.4, 0]}>
                    <mesh>
                        <torusGeometry args={[11.8, 0.010, 16, 100]} />
                        <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} />
                    </mesh>
                    <mesh position={[-11.8, 0, 0]}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshBasicMaterial color="#e0f0ff" />
                    </mesh>
                </group>

                {/* Orbit 3 — distant high orbit, faintest */}
                <group rotation={[Math.PI / 2.6, 1.1, 0.3]}>
                    <mesh>
                        <torusGeometry args={[13.2, 0.008, 16, 100]} />
                        <meshBasicMaterial color="#0284c7" transparent opacity={0.11} />
                    </mesh>
                </group>
            </group>

                {showNavigation && (
                    <group rotation={[0.16, 0.55, 0]}> 
                        <primitive object={navRoute.line} />
                        
                        {/* Origin Point */}
                        <group position={navRoute.originPoint} renderOrder={200}>
                            <mesh>
                                <sphereGeometry args={[0.28, 18, 18]} />
                                <meshStandardMaterial depthWrite={false} color="#10b981" emissive="#34d399" emissiveIntensity={2.8} metalness={0.6} roughness={0.08} />
                            </mesh>
                            <mesh>
                                <sphereGeometry args={[0.36, 12, 12]} />
                                <meshBasicMaterial color="#34d399" transparent opacity={0.24} toneMapped={false} depthWrite={false} />
                            </mesh>
                        </group>

                        {/* Moving Waypoint */}
                        <group ref={navMarkerRef} renderOrder={190}>
                            <mesh>
                                <sphereGeometry args={[0.18, 18, 18]} />
                                <meshStandardMaterial depthWrite={false} emissive="#fbbf24" emissiveIntensity={2.4} color="#c97817" metalness={0.5} roughness={0.12} />
                            </mesh>
                            <mesh ref={navMarkerHaloRef}>
                                <sphereGeometry args={[0.28, 12, 12]} />
                                <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
                            </mesh>
                        </group>

                        {/* Destination Point */}
                        <group position={navRoute.destPoint} renderOrder={200}>
                            <mesh>
                                <sphereGeometry args={[0.28, 18, 18]} />
                                <meshStandardMaterial depthWrite={false} color="#dc2626" emissive="#f87171" emissiveIntensity={2.8} metalness={0.6} roughness={0.08} />
                            </mesh>
                            <mesh>
                                <sphereGeometry args={[0.36, 12, 12]} />
                                <meshBasicMaterial color="#f87171" transparent opacity={0.24} toneMapped={false} depthWrite={false} />
                            </mesh>
                        </group>
                    </group>
                )}

                {/* Old orbiting satellites removed as they are now integrated into ringsRef */}
        </group>
    );
}
