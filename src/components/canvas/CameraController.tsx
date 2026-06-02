import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraController() {
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state) => {
        // High-fidelity gyroscopic parallax
        const targetX = mouse.current.x * 2.5;
        const targetY = mouse.current.y * 1.5;

        state.camera.position.lerp(new THREE.Vector3(targetX, targetY, 14), 0.05);
        state.camera.lookAt(0, 0, 0);
    });

    return null;
}