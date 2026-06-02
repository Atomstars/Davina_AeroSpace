import { useRef, useMemo, useState } from 'react';
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
    const satelliteOrbitRefs = useRef<THREE.Group[]>([]);
    const orbitLineRefs = useRef<THREE.Line[]>([]);
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
    const { dayMap, nightMap, cloudsMap, bumpMap } = useMemo(() => {
        const day = rawDayMap.clone();
        day.colorSpace = THREE.SRGBColorSpace;
        day.anisotropy = 16;
        day.needsUpdate = true;

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

        return { dayMap: day, nightMap: night, cloudsMap: clouds, bumpMap: bump };
    }, [rawDayMap, rawNightMap, rawCloudsMap, rawBumpMap]);

    const [satelliteNodes] = useState(() => {
        return Array.from({ length: 7 }).map(() => ({
            orbitIndex: Math.floor(Math.random() * 2),
            angle: Math.random() * Math.PI * 2,
            speed: 0.04 + Math.random() * 0.06,
        }));
    });

    const orbitLines = useMemo(() => {
        const createOrbitGeometry = (radius: number) => {
            const segments = 160;
            const points: THREE.Vector3[] = [];
            for (let i = 0; i <= segments; i += 1) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
            }
            return new THREE.BufferGeometry().setFromPoints(points);
        };

            return {
            inner: createOrbitGeometry(7.1),
            middle: createOrbitGeometry(7.6),
        };
    }, []);

    const orbitMeshes = useMemo(() => {
        const createOrbitLine = (geometry: THREE.BufferGeometry, color: number, opacity: number) => {
            const material = new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
                toneMapped: false,
            });
            const line = new THREE.Line(geometry, material);
            return line;
        };

        return {
            inner: createOrbitLine(orbitLines.inner, 0x22d3ee, 0.18),
            middle: createOrbitLine(orbitLines.middle, 0x38bdf8, 0.16),
        };
    }, [orbitLines]);

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
        const hoverTilt = new THREE.Vector2(0.18 + currentPointer.y * 0.22, currentPointer.x * 0.22);
        const dragTilt = new THREE.Vector2(dragOffset.current.y * 0.8, dragOffset.current.x * 0.9);
        const baseTilt = isDragging.current ? new THREE.Vector2(0.18, 0).add(dragTilt) : hoverTilt;

        targetTilt.current.lerp(baseTilt, Math.min(delta * 4.6, 1));
        currentTilt.current.lerp(targetTilt.current, Math.min(delta * 7.2, 1));

        if (globeGroupRef.current) {
            gyroPhase.current += delta * 0.85;
            globeGroupRef.current.rotation.y += delta * (showNavigation ? 0.006 : 0.03);
            globeGroupRef.current.rotation.x = currentTilt.current.x + Math.sin(gyroPhase.current) * (showNavigation ? 0.01 : 0.03);
            globeGroupRef.current.rotation.z = currentTilt.current.y + Math.sin(gyroPhase.current * 0.55) * (showNavigation ? 0.01 : 0.03);
        }
        
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.03;
            cloudsRef.current.rotation.x += delta * 0.002; 
        }

        if (ringsRef.current) {
            ringsRef.current.rotation.y -= delta * 0.02;
            ringsRef.current.rotation.z += delta * 0.01;
        }

        satelliteOrbitRefs.current.forEach((orbitRef, idx) => {
            const node = satelliteNodes[idx];
            if (!orbitRef || !node) return;
            orbitRef.rotation.z += delta * node.speed;
        });

        orbitLineRefs.current.forEach((line, idx) => {
            if (!line || !(line.material instanceof THREE.LineBasicMaterial)) return;
            line.material.opacity = 0.1 + 0.05 * Math.sin(Date.now() * 0.002 + idx);
        });

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

            {/* REALISTIC EARTH BASE */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[6.5, 64, 64]} />
                <meshStandardMaterial
                    map={dayMap} 
                    color="#586773"
                    emissiveMap={nightMap} 
                    emissive={new THREE.Color("#d79845")}
                    emissiveIntensity={0.72}
                    bumpMap={bumpMap} 
                    bumpScale={0.38}
                    roughness={0.82}
                    metalness={0.08}
                />
            </mesh>

            {/* CLOUDS LAYER */}
            <mesh ref={cloudsRef} rotation={[0.2, 0, 0]}>
                <sphereGeometry args={[6.53, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.16} 
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* ATMOSPHERIC HALO */}
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[6.7, 64, 64]} />
                <meshBasicMaterial 
                    color="#4D90FE" 
                    transparent 
                    opacity={0.065} 
                    side={THREE.BackSide} 
                    blending={THREE.AdditiveBlending} 
                />
            </mesh>

            {/* TRUE 3D ORBITAL RINGS & SATELLITES */}
            <group ref={ringsRef}>
                <group rotation={[Math.PI / 2, 0, 0]}> 
                    <mesh>
                        <torusGeometry args={[7.1, 0.018, 16, 128]} />
                        <meshBasicMaterial color="#17b7ff" transparent opacity={0.34} toneMapped={false} />
                    </mesh>
                    <primitive object={orbitMeshes.inner} ref={(el: THREE.Line | null) => { if (el) orbitLineRefs.current[0] = el; }} />
                </group>

                <group rotation={[0, Math.PI / 2, 0]}> 
                    <mesh>
                        <torusGeometry args={[7.6, 0.018, 16, 128]} />
                        <meshBasicMaterial color="#17b7ff" transparent opacity={0.28} toneMapped={false} />
                    </mesh>
                    <primitive object={orbitMeshes.middle} ref={(el: THREE.Line | null) => { if (el) orbitLineRefs.current[1] = el; }} />
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

                {/* ORBITING DRONES */}
                {satelliteNodes.map((node, i) => {
                    const radius = node.orbitIndex === 0 ? 7.1 : 7.6;
                    const rot: [number, number, number] = node.orbitIndex === 0 ? [Math.PI / 2, 0, 0] : [0, Math.PI / 2, 0];
                    
                    return (
                        <group key={i} rotation={rot} ref={(el) => { if (el) satelliteOrbitRefs.current[i] = el; }}>
                            <group position={[Math.cos(node.angle) * radius, Math.sin(node.angle) * radius, 0]} scale={i % 3 === 0 ? 1.24 : 1}>
                                <mesh rotation={[0, 0, Math.PI / 4]}>
                                    <boxGeometry args={[0.18, 0.08, 0.08]} />
                                    <meshStandardMaterial color="#cbd5e1" emissive="#0891b2" emissiveIntensity={0.35} roughness={0.45} metalness={0.22} />
                                </mesh>
                                <mesh position={[0.2, 0, 0]}>
                                    <boxGeometry args={[0.24, 0.018, 0.1]} />
                                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.62} toneMapped={false} />
                                </mesh>
                                <mesh position={[-0.2, 0, 0]}>
                                    <boxGeometry args={[0.24, 0.018, 0.1]} />
                                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.62} toneMapped={false} />
                                </mesh>
                                <mesh position={[0, -0.09, 0]}>
                                    <coneGeometry args={[0.055, 0.16, 4]} />
                                    <meshBasicMaterial color="#67e8f9" transparent opacity={0.72} toneMapped={false} />
                                </mesh>
                            </group>
                        </group>
                    );
                })}
            </group>
        </group>
    );
}
