import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function makeShape(points: Array<[number, number]>) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], index) => {
        if (index === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    });
    shape.closePath();
    return shape;
}

function makeExtrude(points: Array<[number, number]>, depth = 0.08, bevelSize = 0.018) {
    return new THREE.ExtrudeGeometry(makeShape(points), {
        depth,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize,
        bevelThickness: bevelSize,
    });
}

function makeHexTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#090b0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(205, 213, 220, 0.34)';
    ctx.lineWidth = 2;

    const size = 21;
    const width = Math.sqrt(3) * size;
    const height = size * 2;
    const stepY = height * 0.74;

    for (let y = -height; y < canvas.height + height; y += stepY) {
        for (let x = -width; x < canvas.width + width; x += width) {
            const row = Math.round(y / stepY);
            const cx = x + (row % 2 === 0 ? 0 : width / 2);
            const cy = y;
            ctx.beginPath();
            for (let i = 0; i < 6; i += 1) {
                const angle = Math.PI / 6 + (Math.PI / 3) * i;
                const px = cx + Math.cos(angle) * size;
                const py = cy + Math.sin(angle) * size;
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
    texture.repeat.set(1.7, 1.1);
    texture.anisotropy = 12;
    return texture;
}

function DuctedFan({ x }: { x: number }) {
    const rotorRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
        if (rotorRef.current) rotorRef.current.rotation.z += delta * 34;
    });

    return (
        <group position={[x, -0.02, 0.16]} rotation={[0.05, 0, 0]}>
            <mesh>
                <torusGeometry args={[0.43, 0.065, 22, 96]} />
                <meshStandardMaterial color="#02050a" metalness={0.92} roughness={0.18} />
            </mesh>
            <mesh>
                <torusGeometry args={[0.51, 0.018, 12, 96]} />
                <meshBasicMaterial color="#17b7ff" transparent opacity={0.28} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, -0.035]}>
                <circleGeometry args={[0.39, 64]} />
                <meshBasicMaterial color="#020617" transparent opacity={0.42} side={THREE.DoubleSide} />
            </mesh>
            <group ref={rotorRef}>
                {[0, 1, 2, 3].map((item) => (
                    <mesh key={item} rotation={[0, 0, item * Math.PI / 2]}>
                        <boxGeometry args={[0.62, 0.038, 0.018]} />
                        <meshStandardMaterial color="#0a0f16" metalness={0.95} roughness={0.12} />
                    </mesh>
                ))}
            </group>
            <mesh>
                <sphereGeometry args={[0.082, 18, 18]} />
                <meshStandardMaterial color="#dbe2e8" metalness={0.94} roughness={0.12} />
            </mesh>
            <pointLight color="#f59e0b" intensity={0.45} distance={1.45} position={[0.18 * Math.sign(x), 0.04, 0.1]} />
        </group>
    );
}

function SpineSegment({ y, scale = 1 }: { y: number; scale?: number }) {
    return (
        <mesh position={[0, y, 0.23]} scale={[scale, 1, 1]}>
            <boxGeometry args={[0.48, 0.32, 0.16]} />
            <meshStandardMaterial color="#f2f5f7" metalness={0.78} roughness={0.16} />
        </mesh>
    );
}

export default function MorphingHeroDrone() {
    const groupRef = useRef<THREE.Group>(null!);
    const leftWingRef = useRef<THREE.Mesh>(null!);
    const rightWingRef = useRef<THREE.Mesh>(null!);
    const leftTailRef = useRef<THREE.Mesh>(null!);
    const rightTailRef = useRef<THREE.Mesh>(null!);
    const gyroARef = useRef<THREE.Mesh>(null!);
    const gyroBRef = useRef<THREE.Mesh>(null!);

    const hexTexture = useMemo(() => makeHexTexture(), []);
    const carbonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#24282c',
        map: hexTexture ?? undefined,
        metalness: 0.86,
        roughness: 0.22,
        emissive: '#030a0e',
        emissiveIntensity: 0.08,
        side: THREE.DoubleSide,
    }), [hexTexture]);
    const blackCarbonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#030406',
        map: hexTexture ?? undefined,
        metalness: 0.9,
        roughness: 0.2,
        emissive: '#01080c',
        emissiveIntensity: 0.1,
        side: THREE.DoubleSide,
    }), [hexTexture]);

    const geometries = useMemo(() => ({
        leftWing: makeExtrude([
            [-3.15, 0.2],
            [-2.2, 0.55],
            [-1.18, 0.62],
            [-0.56, 0.42],
            [-0.74, -0.16],
            [-2.0, -0.32],
            [-3.35, -0.05],
        ], 0.1, 0.02),
        rightWing: makeExtrude([
            [3.15, 0.2],
            [2.2, 0.55],
            [1.18, 0.62],
            [0.56, 0.42],
            [0.74, -0.16],
            [2.0, -0.32],
            [3.35, -0.05],
        ], 0.1, 0.02),
        leftTail: makeExtrude([
            [-2.22, -0.34],
            [-0.74, -0.2],
            [-0.9, -0.72],
            [-2.32, -0.84],
            [-3.08, -0.46],
        ], 0.085, 0.016),
        rightTail: makeExtrude([
            [2.22, -0.34],
            [0.74, -0.2],
            [0.9, -0.72],
            [2.32, -0.84],
            [3.08, -0.46],
        ], 0.085, 0.016),
    }), []);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;

        if (groupRef.current) {
            // stronger lateral sway and hover bob
            groupRef.current.position.x = Math.sin(t * 0.6) * 0.36;
            groupRef.current.position.y = 2.9 + Math.sin(t * 1.4) * 0.18 + Math.sin(t * 0.28) * 0.04;
            groupRef.current.position.z = 4.35 + Math.sin(t * 0.45) * 0.18;

            // more pronounced rotations for liveliness
            groupRef.current.rotation.x = -0.26 + Math.sin(t * 1.1) * 0.06;
            groupRef.current.rotation.y = Math.sin(t * 0.9) * 0.12;
            groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.08;
        }

        const morph = Math.sin(t * 2.2);
        // increase wing flap amplitude and speed
        if (leftWingRef.current) leftWingRef.current.rotation.z = 0.02 + morph * 0.06;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -0.02 - morph * 0.06;
        // tails follow with stronger response
        if (leftTailRef.current) leftTailRef.current.rotation.z = -0.06 - morph * 0.07;
        if (rightTailRef.current) rightTailRef.current.rotation.z = 0.06 + morph * 0.07;
        // speed up gyros for more motion
        if (gyroARef.current) gyroARef.current.rotation.z += delta * 2.6;
        if (gyroBRef.current) gyroBRef.current.rotation.z -= delta * 3.2;
    });

    return (
        <group ref={groupRef} position={[0, 2.9, 4.35]} rotation={[-0.26, 0, 0]} scale={1.15}>
            

            <mesh ref={leftWingRef} geometry={geometries.leftWing} material={carbonMaterial} />
            <mesh ref={rightWingRef} geometry={geometries.rightWing} material={carbonMaterial} />
            <mesh ref={leftTailRef} geometry={geometries.leftTail} material={blackCarbonMaterial} position={[0, 0, -0.025]} />
            <mesh ref={rightTailRef} geometry={geometries.rightTail} material={blackCarbonMaterial} position={[0, 0, -0.025]} />

            <DuctedFan x={-0.72} />
            <DuctedFan x={0.72} />

            

            <group>
                <SpineSegment y={0.38} scale={0.88} />
                <SpineSegment y={0.02} />
                <SpineSegment y={-0.34} scale={0.92} />
                <mesh position={[0, 0.66, 0.24]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.33, 0.33, 0.14]} />
                    <meshStandardMaterial color="#f8fafc" metalness={0.76} roughness={0.14} />
                </mesh>
                <mesh position={[0, -0.68, 0.2]}>
                    <coneGeometry args={[0.34, 0.28, 4]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.18} />
                </mesh>
                <mesh position={[0, -0.92, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.26, 0.18, 0.34, 20]} />
                    <meshStandardMaterial color="#020617" metalness={0.86} roughness={0.16} />
                </mesh>
            </group>

            <group position={[0, -0.14, 0.42]}>
                <mesh>
                    <sphereGeometry args={[0.1, 18, 18]} />
                    <meshStandardMaterial color="#020617" metalness={0.88} roughness={0.12} />
                </mesh>
                <mesh position={[-0.17, 0.02, 0]}>
                    <sphereGeometry args={[0.035, 10, 10]} />
                    <meshBasicMaterial color="#f59e0b" toneMapped={false} />
                </mesh>
                <mesh position={[0.17, 0.02, 0]}>
                    <sphereGeometry args={[0.035, 10, 10]} />
                    <meshBasicMaterial color="#17b7ff" toneMapped={false} />
                </mesh>
            </group>

            <pointLight color="#17b7ff" intensity={1.2} distance={4.2} position={[0, -0.1, 1.0]} />
            <pointLight color="#ffffff" intensity={0.45} distance={3.2} position={[0, 0.75, 1.4]} />
        </group>
    );
}
