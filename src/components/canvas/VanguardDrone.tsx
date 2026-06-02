import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface VanguardDroneProps {
    initialPosition: [number, number, number];
    droneScale: number;
    onFire?: (start: THREE.Vector3, target: THREE.Vector3) => void;
    isDynamic?: boolean;
    lookTarget?: 'user' | 'earth'; // PROP ADDITION: Explicit orientation target
    showRadar?: boolean;
    laserToEarth?: boolean;
    dynamicRange?: number;
    dynamicHeight?: number;
    freezeHover?: boolean;
}

function Rotor({ position }: { position: [number, number, number] }) {
    const rotorRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
        if (rotorRef.current) rotorRef.current.rotation.y += delta * 14;
    });

    return (
        <group ref={rotorRef} position={position}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.33, 0.055, 16, 48]} />
                <meshStandardMaterial color="#4b5563" metalness={0.92} roughness={0.24} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.275, 0.275, 0.06, 32]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.22} />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, (i / 6) * Math.PI * 2]}>
                    <boxGeometry args={[0.045, 0.22, 0.012]} />
                    <meshStandardMaterial color="#111827" metalness={0.88} roughness={0.25} />
                </mesh>
            ))}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.18} />
            </mesh>
        </group>
    );
}

function WingFrame() {
    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-2.2, 0.14);
        shape.lineTo(-1.35, 0.72);
        shape.lineTo(0, 1.0);
        shape.lineTo(1.35, 0.72);
        shape.lineTo(2.2, 0.14);
        shape.lineTo(1.2, -0.82);
        shape.lineTo(0, -1.05);
        shape.lineTo(-1.2, -0.82);
        shape.lineTo(-2.2, 0.14);
        return new THREE.ShapeGeometry(shape);
    }, []);

    const hexTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        const size = 34;
        const w = Math.sqrt(3) * size;
        const h = 2 * size;
        const vStep = (3 / 4) * h;

        for (let y = -h; y < canvas.height + h; y += vStep) {
            for (let x = -w; x < canvas.width + w; x += w) {
                const offsetX = ((Math.floor(y / vStep) % 2) * w) / 2;
                const cx = x + offsetX;
                const cy = y;
                ctx.beginPath();
                for (let i = 0; i < 6; i += 1) {
                    const angle = (Math.PI / 3) * i + Math.PI / 6;
                    const px = cx + size * Math.cos(angle);
                    const py = cy + size * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.2, 1.2);
        texture.anisotropy = 8;
        return texture;
    }, []);

    return (
        <group>
            <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#d1d5db" metalness={0.95} roughness={0.18} map={hexTexture ?? undefined} />
            </mesh>
            <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.16} wireframe />
            </mesh>
            <mesh position={[0, 0.02, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.25, 0.12]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
            </mesh>
        </group>
    );
}

export default function VanguardDrone({ 
    initialPosition, 
    droneScale, 
    onFire, 
    isDynamic = false,
    lookTarget = 'earth', // Default sentry orientation
    showRadar = false,
    laserToEarth = false,
    dynamicRange = 6,
    dynamicHeight = 1.5,
    freezeHover = false,
}: VanguardDroneProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const bodyRef = useRef<THREE.Group>(null!);
    const radarRef = useRef<THREE.Mesh>(null!);
    const laserRef = useRef<THREE.Mesh>(null!);
    const targetObject = useMemo(() => new THREE.Object3D(), []);

    const { scene, camera, raycaster, pointer } = useThree();
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!isDynamic) return;
        const handleMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [isDynamic]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();

        if (isDynamic) {
            // Constrained the dynamic drone so it stays visibly above the DAVINA text
            const targetX = mouse.current.x * dynamicRange;
            const targetY = (mouse.current.y * 2) + dynamicHeight; 

            groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, initialPosition[2]), 5 * delta);
            if (bodyRef.current) {
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, (targetY - groupRef.current.position.y) * 0.3, 8 * delta);
                bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, (targetX - groupRef.current.position.x) * -0.4, 8 * delta);
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, (mouse.current.x * -0.2), 8 * delta);
            }
        } else {
            if (freezeHover) {
                groupRef.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
            } else {
                groupRef.current.position.set(
                    initialPosition[0],
                    initialPosition[1] + Math.sin(t * 1.5) * 0.2,
                    initialPosition[2]
                );
            }
        }

        // --- NEW ORIENTATION LOGIC ---
        const globeElevation = -4.5; // Must match Scene.tsx elevation
        if (!isDynamic && lookTarget === 'earth') {
            // Rotates to target the elevated globe center
            targetObject.position.set(0, globeElevation, 0);
            groupRef.current.lookAt(targetObject.position);
        }
        if (!isDynamic && lookTarget === 'user') {
            targetObject.position.copy(camera.position);
            groupRef.current.lookAt(targetObject.position);
        }

        // Spin the radar cone if it's a radar variant
        if (radarRef.current) {
            radarRef.current.rotation.y += delta * 2;
        }

        if (laserToEarth && laserRef.current) {
            const worldTarget = new THREE.Vector3(0, -4.5, 0);
            const localTarget = groupRef.current.worldToLocal(worldTarget.clone());
            const length = Math.max(0.8, localTarget.length());
            const direction = localTarget.clone().normalize();
            laserRef.current.position.copy(localTarget.clone().multiplyScalar(0.5));
            laserRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            laserRef.current.scale.set(1, length, 1);
        }

        if (bodyRef.current) {
            bodyRef.current.position.y = Math.sin(t * 2.2) * 0.05;
        }
    });

    useEffect(() => {
        if (!isDynamic || !onFire) return;

        const isOwnObject = (obj: THREE.Object3D) => {
            let current: THREE.Object3D | null = obj;
            while (current) {
                if (current === groupRef.current) return true;
                current = current.parent;
            }
            return false;
        };

        const handleFire = () => {
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster
                .intersectObjects(scene.children, true)
                .filter((hit) => !isOwnObject(hit.object));

            if (groupRef.current) {
                const spawnPos = new THREE.Vector3();
                groupRef.current.getWorldPosition(spawnPos);
                const targetPos = intersects.length > 0
                    ? intersects[0].point
                    : new THREE.Vector3(pointer.x * 3, -4.5 + pointer.y * 1.2, pointer.x * 0.8);
                onFire(spawnPos, targetPos);
                groupRef.current.position.z += 0.22;
            }
        };

        window.addEventListener('pointerdown', handleFire);
        return () => window.removeEventListener('pointerdown', handleFire);
    }, [onFire, isDynamic, camera, pointer, raycaster, scene]);

    // Simple FX Materials remain (no lighting calculations required)
    const materials = useMemo(() => ({
        thrust: new THREE.MeshBasicMaterial({ color: "#a5f3fc", transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, toneMapped: false }),
        radarGlow: new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
    }), []);

    return (
        <group ref={groupRef} scale={droneScale} position={initialPosition}>
            <group ref={bodyRef}>
                <WingFrame />

                <mesh position={[0, 0.12, 0.16]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.09, 1.18, 8, 12]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.22} metalness={0.95} />
                </mesh>
                <mesh position={[0, 0.14, 0.85]}>
                    <boxGeometry args={[0.18, 0.08, 0.52]} />
                    <meshStandardMaterial color="#334155" roughness={0.26} metalness={0.9} />
                </mesh>
                <mesh position={[0, 0.17, 0.1]}>
                    <boxGeometry args={[0.07, 0.015, 0.86]} />
                    <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.55} metalness={0.65} roughness={0.25} />
                </mesh>
                <mesh position={[0, 0.15, -0.72]} rotation={[0.25, 0, 0]}>
                    <coneGeometry args={[0.12, 0.45, 4]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.28} />
                </mesh>
                <mesh position={[-0.78, 0.11, 0.44]} rotation={[0, 0.3, 0.2]}>
                    <cylinderGeometry args={[0.018, 0.018, 1.02, 10]} />
                    <meshStandardMaterial color="#111827" metalness={0.94} roughness={0.2} />
                </mesh>
                <mesh position={[0.78, 0.11, 0.44]} rotation={[0, -0.3, -0.2]}>
                    <cylinderGeometry args={[0.018, 0.018, 1.02, 10]} />
                    <meshStandardMaterial color="#111827" metalness={0.94} roughness={0.2} />
                </mesh>
                <mesh position={[-0.82, 0.08, -0.46]} rotation={[0, -0.35, 0.24]}>
                    <cylinderGeometry args={[0.018, 0.018, 0.94, 10]} />
                    <meshStandardMaterial color="#111827" metalness={0.94} roughness={0.2} />
                </mesh>
                <mesh position={[0.82, 0.08, -0.46]} rotation={[0, 0.35, -0.24]}>
                    <cylinderGeometry args={[0.018, 0.018, 0.94, 10]} />
                    <meshStandardMaterial color="#111827" metalness={0.94} roughness={0.2} />
                </mesh>

                <Rotor position={[-1.56, 0.12, 0.62]} />
                <Rotor position={[1.56, 0.12, 0.62]} />
                <Rotor position={[-1.34, 0.1, -0.84]} />
                <Rotor position={[1.34, 0.1, -0.84]} />
            </group>

            {/* HIGH-PERFORMANCE ENGINE THRUST (Keep geometry as FX) */}
            <mesh position={[-0.2, 0.07, -1.36]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.016, 0.82, 14]} />
                <primitive object={materials.thrust} attach="material" />
            </mesh>
            <mesh position={[0.2, 0.07, -1.36]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.016, 0.82, 14]} />
                <primitive object={materials.thrust} attach="material" />
            </mesh>

            {/* RADAR Variant Specific FX (Now on all drones, looks sleeker) */}
            {showRadar && (
                <group position={[0, -0.36, 0]}>
                    <mesh ref={radarRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.4]}>
                        <cylinderGeometry args={[1.1, 0.02, 2.8, 28, 1, true]} />
                        <primitive object={materials.radarGlow} attach="material" />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshBasicMaterial color="#0284c7" />
                    </mesh>
                    <spotLight
                        position={[0, 0, 0]}
                        angle={0.4}
                        penumbra={0.8}
                        intensity={15}
                        color="#0ea5e9"
                        distance={20}
                        castShadow={false}
                    />
                </group>
            )}

            {laserToEarth && (
                <mesh ref={laserRef}>
                    <cylinderGeometry args={[0.015, 0.13, 1, 18, 1, true]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
                </mesh>
            )}

            {/* Heavy Rotors removed - baked into GLB model */}
        </group>
    );
}
