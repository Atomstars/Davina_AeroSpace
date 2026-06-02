import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

export default function DynamicEnvironment() {
    const gridRef = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        const targetX = state.pointer.x * 2.0;
        const targetY = state.pointer.y * 1.5;
        state.camera.position.lerp(new THREE.Vector3(targetX, targetY, 13), 5 * delta);
        state.camera.lookAt(0, -1, 0);

        if (gridRef.current) {
            gridRef.current.position.x = THREE.MathUtils.lerp(gridRef.current.position.x, state.pointer.x * -2, 5 * delta);
        }
    });

    return (
        <group ref={gridRef}>
            <Grid position={[0, -12, -10]} args={[150, 150]} cellSize={1} cellThickness={1} cellColor="#0284c7" sectionSize={5} sectionThickness={1.5} sectionColor="#0ea5e9" fadeDistance={70} />
        </group>
    );
}