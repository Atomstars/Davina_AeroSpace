import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function KineticStrike({ startPos, targetPos }: any) {
    const beamRef = useRef<THREE.Mesh>(null!);
    const shockwaveRef = useRef<THREE.Mesh>(null!);
    const shockwave2Ref = useRef<THREE.Mesh>(null!);
    const ageRef = useRef(0);
    const start = useRef<THREE.Vector3>(startPos.clone());
    const end = useRef<THREE.Vector3>(targetPos.clone());
    const travel = useRef<THREE.Vector3>(new THREE.Vector3());

    useFrame((_, delta) => {
        ageRef.current += delta;
        const age = ageRef.current;

        if (beamRef.current) {
            const progress = Math.min(1, age * 5);
            const current = start.current.clone().lerp(end.current, progress);
            travel.current.copy(end.current).sub(start.current);
            const distance = Math.max(0.001, travel.current.length());
            const direction = travel.current.normalize();

            beamRef.current.position.copy(current);
            beamRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
            beamRef.current.scale.set(Math.max(0.08, 1 - age * 1.2), distance * 0.08, Math.max(0.08, 1 - age * 1.2));
        }

        if (shockwaveRef.current) {
            shockwaveRef.current.position.copy(targetPos);
            shockwaveRef.current.lookAt(0, 0, 0); // Orient to center of the globe
            const scale = 1 + age * 25; // Explosive rapid expansion
            shockwaveRef.current.scale.set(scale, scale, scale);
            (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - age * 2.5);
        }

        if (shockwave2Ref.current) {
            shockwave2Ref.current.position.copy(targetPos);
            shockwave2Ref.current.lookAt(0, 0, 0);
            const scale = 1 + age * 12; // Secondary slower shockwave
            shockwave2Ref.current.scale.set(scale, scale, scale);
            (shockwave2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - age * 1.5);
        }
    });

    return (
        <group>
            {/* THE RAZOR BEAM: Sharper cylinder, pure white core, toneMapped=false for extreme Bloom */}
            <mesh ref={beamRef} position={startPos}>
                <cylinderGeometry args={[0.06, 0.018, 10, 10]} />
                <meshBasicMaterial
                    color="#e0f2fe"
                    toneMapped={false}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* PRIMARY IMPACT SHOCKWAVE */}
            <mesh ref={shockwaveRef} position={targetPos}>
                <ringGeometry args={[0.1, 0.3, 32]} />
                <meshBasicMaterial
                    color="#a5f3fc"
                    toneMapped={false}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* SECONDARY KINETIC RING */}
            <mesh ref={shockwave2Ref} position={targetPos}>
                <ringGeometry args={[0.2, 0.5, 32]} />
                <meshBasicMaterial
                    color="#0ea5e9"
                    toneMapped={false}
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
