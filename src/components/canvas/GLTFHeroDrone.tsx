import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { applyDroneFlight } from '../../lib/droneFlight';

/**
 * Path to the hero drone model. Drop a `.glb` here:
 *   public/models/drone.glb
 * If the file is missing or fails to load, the parent <HeroDrone> error
 * boundary transparently falls back to the procedural drone.
 */
export const DRONE_MODEL_URL = '/models/drone.glb';

export default function GLTFHeroDrone({ pointer }: { pointer?: THREE.Vector2 }) {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene } = useGLTF(DRONE_MODEL_URL);

    // Clone so the cached GLTF isn't mutated; tune materials for the scene.
    const model = useMemo(() => {
        const clone = scene.clone(true);
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Normalise to a consistent on-screen size regardless of source scale.
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSpan = 5.5;
        const s = targetSpan / maxDim;
        clone.scale.setScalar(s);
        clone.position.sub(center.multiplyScalar(s));

        clone.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.isMesh) {
                mesh.castShadow = false;
                mesh.receiveShadow = false;
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat && 'envMapIntensity' in mat) {
                    mat.envMapIntensity = 1.6;
                }
            }
        });
        return clone;
    }, [scene]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const ptr = pointer ?? new THREE.Vector2(0, 0);
        if (groupRef.current) applyDroneFlight(groupRef.current, t, ptr);
    });

    return (
        <group ref={groupRef} position={[0, 9.6, 2.5]} rotation={[-0.04, 0, 0]}>
            <primitive object={model} />
            {/* Nav strobes so the model reads as a live aircraft */}
            <pointLight color="#f59e0b" intensity={0.6} distance={2.2} position={[-1.4, -0.1, 0]} />
            <pointLight color="#22d3ee" intensity={0.6} distance={2.2} position={[1.4, -0.1, 0]} />
            <pointLight color="#b8d8f8" intensity={2.4} distance={8.0} position={[-2.4, 2.8, 2.5]} />
        </group>
    );
}

// Best-effort preload; harmless if the file is absent.
try {
    useGLTF.preload(DRONE_MODEL_URL);
} catch {
    /* no-op */
}
