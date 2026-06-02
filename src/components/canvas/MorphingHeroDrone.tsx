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
        bevelSegments: 3,
        bevelSize,
        bevelThickness: bevelSize,
    });
}

/**
 * Exposed Rotor — high-visibility aerospace propellers.
 * Features bright, exposed blades that spin rapidly for obvious motion.
 */
function ExposedRotor({ x }: { x: number }) {
    const rotorRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
        // Spin rapidly (motion blur effect)
        if (rotorRef.current) rotorRef.current.rotation.y += delta * 45;
    });

    return (
        <group position={[x, 0.15, 0.18]}>
            {/* Motor housing */}
            <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.16, 24]} />
                <meshStandardMaterial color="#050c14" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* High-visibility spinning blades */}
            <group ref={rotorRef}>
                {/* Hub */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
                    <meshStandardMaterial color="#e2ecf4" metalness={0.96} roughness={0.10} />
                </mesh>
                {/* 4 Blades — Bright aerospace alloy for high visibility */}
                {[0, 1, 2, 3].map((item) => (
                    <mesh key={item} rotation={[0, item * Math.PI / 2, 0]} position={[0, 0, 0]}>
                        <boxGeometry args={[1.1, 0.015, 0.06]} />
                        {/* Translate geometry so it spins from the hub, not its center */}
                        <meshStandardMaterial color="#c8d8e4" metalness={0.8} roughness={0.2} emissive="#0ea5e9" emissiveIntensity={0.15} />
                    </mesh>
                ))}
            </group>

            {/* Navigation light (Amber left, Cyan right) */}
            <pointLight color={x < 0 ? "#f59e0b" : "#3de8ff"} intensity={0.8} distance={2.0} position={[0, -0.1, 0]} />
        </group>
    );
}

function SpineSegment({ y, scale = 1 }: { y: number; scale?: number }) {
    return (
        <mesh position={[0, y, 0.24]} scale={[scale, 1, 1]}>
            <boxGeometry args={[0.50, 0.30, 0.17]} />
            <meshStandardMaterial color="#c8d8e4" metalness={0.82} roughness={0.14} />
        </mesh>
    );
}

export default function MorphingHeroDrone({ pointer }: { pointer?: THREE.Vector2 }) {
    const groupRef = useRef<THREE.Group>(null!);
    const leftWingRef = useRef<THREE.Mesh>(null!);
    const rightWingRef = useRef<THREE.Mesh>(null!);
    const leftTailRef = useRef<THREE.Mesh>(null!);
    const rightTailRef = useRef<THREE.Mesh>(null!);
    const gyroARef = useRef<THREE.Mesh>(null!);
    const gyroBRef = useRef<THREE.Mesh>(null!);

    /**
     * Wing surface material — anodised aerospace alloy.
     * Stealthy, high metalness, low roughness = crisp reflections showing lighting detail.
     */
    const wingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#0f1724',
        metalness: 0.98,
        roughness: 0.12,
        envMapIntensity: 1.4,
    }), []);

    const wingEdgeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#b8ccd8',
        metalness: 0.98,
        roughness: 0.08,
        envMapIntensity: 1.8,
    }), []);

    const geometries = useMemo(() => ({
        /* Refined wing shapes — cleaner delta sweep, aerospace silhouette */
        leftWing: makeExtrude([
            [-3.2, 0.18],
            [-2.3, 0.52],
            [-1.22, 0.60],
            [-0.58, 0.40],
            [-0.76, -0.14],
            [-2.05, -0.30],
            [-3.42, -0.04],
        ], 0.09, 0.022),
        rightWing: makeExtrude([
            [3.2, 0.18],
            [2.3, 0.52],
            [1.22, 0.60],
            [0.58, 0.40],
            [0.76, -0.14],
            [2.05, -0.30],
            [3.42, -0.04],
        ], 0.09, 0.022),
        leftTail: makeExtrude([
            [-2.28, -0.32],
            [-0.76, -0.18],
            [-0.92, -0.70],
            [-2.38, -0.82],
            [-3.12, -0.44],
        ], 0.082, 0.018),
        rightTail: makeExtrude([
            [2.28, -0.32],
            [0.76, -0.18],
            [0.92, -0.70],
            [2.38, -0.82],
            [3.12, -0.44],
        ], 0.082, 0.018),
    }), []);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const ptr = pointer ?? new THREE.Vector2(0, 0);

        if (groupRef.current) {
            /*
             * Position: visually the highest element on screen, well above Earth horizon
             * and DAVINA logo. Flies below the Navigation bar.
             */
            const altHold      = Math.sin(t * 0.30) * 0.038 + Math.sin(t * 0.16) * 0.016;
            const lateralDrift = Math.sin(t * 0.19) * 0.040;
            const depthShift   = Math.sin(t * 0.24) * 0.035;

            groupRef.current.position.x = 0.0 + lateralDrift;
            groupRef.current.position.y = 7.0 + altHold;
            groupRef.current.position.z = 2.5 + depthShift;

            /*
             * Cursor-responsive + continuous autonomous correction.
             * Simulates gyroscopic stabilization against high-altitude wind.
             */
            const cursorRoll  = ptr.x * 0.032;
            const cursorPitch = ptr.y * 0.022;

            const autonomousPitch = Math.sin(t * 1.8) * 0.008 + Math.cos(t * 0.7) * 0.005;
            const autonomousRoll  = Math.cos(t * 1.4) * 0.010 + Math.sin(t * 0.9) * 0.006;

            groupRef.current.rotation.x = -0.05 + cursorPitch + autonomousPitch;
            groupRef.current.rotation.y = -0.03 + cursorRoll;
            groupRef.current.rotation.z =         cursorRoll * 0.38 + autonomousRoll;
        }

        // Aeroelastic micro-flex — very subtle structural response
        const flex = Math.sin(t * 1.5) * 0.012;
        if (leftWingRef.current)  leftWingRef.current.rotation.z  =  flex;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -flex;
        if (leftTailRef.current)  leftTailRef.current.rotation.z  = -flex * 0.5;
        if (rightTailRef.current) rightTailRef.current.rotation.z =  flex * 0.5;

        if (gyroARef.current) gyroARef.current.rotation.z += delta * 2.4;
        if (gyroBRef.current) gyroBRef.current.rotation.z -= delta * 3.0;
    });

    return (
        /*
         * Scale 1.75: slightly larger to account for depth shift, compositing high up.
         * Centered (x=0) for vertical axis alignment.
         */
        <group ref={groupRef} position={[0, 7.0, 2.5]} rotation={[-0.05, -0.03, 0]} scale={1.75}>

            {/* Main wing surfaces — dark anodised aerospace alloy */}
            <mesh ref={leftWingRef} geometry={geometries.leftWing} material={wingMaterial} />
            <mesh ref={rightWingRef} geometry={geometries.rightWing} material={wingMaterial} />

            {/* Tail surfaces — slightly darker */}
            <mesh ref={leftTailRef} geometry={geometries.leftTail} position={[0, 0, -0.022]}>
                <meshStandardMaterial color="#141e28" metalness={0.95} roughness={0.18} />
            </mesh>
            <mesh ref={rightTailRef} geometry={geometries.rightTail} position={[0, 0, -0.022]}>
                <meshStandardMaterial color="#141e28" metalness={0.95} roughness={0.18} />
            </mesh>

            {/* Wing leading-edge highlight strip — chrome accent */}
            <mesh position={[0, 0.34, 0.085]}>
                <boxGeometry args={[5.8, 0.018, 0.016]} />
                <primitive object={wingEdgeMaterial} />
            </mesh>

            {/* Propulsion units */}
            <ExposedRotor x={-1.5} />
            <ExposedRotor x={1.5} />

            {/* Central fuselage */}
            <group>
                <SpineSegment y={0.38} scale={0.86} />
                <SpineSegment y={0.02} />
                <SpineSegment y={-0.34} scale={0.90} />

                {/* Nose sensor dome */}
                <mesh position={[0, 0.70, 0.25]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.30, 0.30, 0.16]} />
                    <meshStandardMaterial color="#e8f2fa" metalness={0.80} roughness={0.12} />
                </mesh>

                {/* Ventral EO/IR sensor pod */}
                <mesh position={[0, -0.70, 0.22]}>
                    <coneGeometry args={[0.32, 0.26, 4]} />
                    <meshStandardMaterial color="#b8cbd8" metalness={0.86} roughness={0.16} />
                </mesh>

                {/* Tail fairing */}
                <mesh position={[0, -0.94, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.24, 0.16, 0.32, 20]} />
                    <meshStandardMaterial color="#050c16" metalness={0.88} roughness={0.14} />
                </mesh>
            </group>

            {/* Sensor turret — front gimbal */}
            <group position={[0, -0.12, 0.45]}>
                <mesh>
                    <sphereGeometry args={[0.096, 20, 20]} />
                    <meshStandardMaterial color="#050c16" metalness={0.90} roughness={0.10} />
                </mesh>
                {/* Port nav light — amber strobe */}
                <mesh position={[-0.16, 0.02, 0]}>
                    <sphereGeometry args={[0.030, 12, 12]} />
                    <meshBasicMaterial color="#f59e0b" toneMapped={false} />
                    <pointLight color="#f59e0b" intensity={0.4} distance={0.8} />
                </mesh>
                {/* Starboard nav light — blue strobe */}
                <mesh position={[0.16, 0.02, 0]}>
                    <sphereGeometry args={[0.030, 12, 12]} />
                    <meshBasicMaterial color="#22d3ee" toneMapped={false} />
                    <pointLight color="#22d3ee" intensity={0.4} distance={0.8} />
                </mesh>
            </group>

            {/* Gyroscopes */}
            <mesh ref={gyroARef} position={[0.3, 0.05, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.12, 0.012, 8, 48]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.38} toneMapped={false} />
            </mesh>
            <mesh ref={gyroBRef} position={[-0.3, 0.05, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.10, 0.012, 8, 48]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.30} toneMapped={false} />
            </mesh>

            {/* Lighting — key light from upper-left + fill from below */}
            <pointLight color="#a8d8ff" intensity={2.2} distance={6.0} position={[-2.0, 2.0, 2.0]} />
            <pointLight color="#ffffff" intensity={0.8} distance={4.0} position={[0, 1.2, 2.0]} />
            <pointLight color="#22d3ee" intensity={0.6} distance={3.5} position={[0, -0.5, 1.2]} />
        </group>
    );
}
