import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DataStreams — GPU-animated particle shell around the globe.
 *
 * Thousands of glowing points orbit along their latitude circles at varying
 * speeds (differential rotation) with a per-particle twinkle and a slow radial
 * pulse. All motion happens in the vertex shader, so the CPU cost is ~zero —
 * the "GPGPU-style" data-rich atmosphere from the Active Theory reference.
 */
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    // Orbit each point around the Y axis (along its latitude circle).
    float ang = aPhase + uTime * aSpeed;
    float c = cos(ang);
    float s = sin(ang);
    vec3 p = position;
    vec3 rotated = vec3(
      p.x * c - p.z * s,
      p.y,
      p.x * s + p.z * c
    );
    // Subtle radial breathing
    rotated *= 1.0 + 0.015 * sin(uTime * 0.6 + aPhase * 6.2831);

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Twinkle
    float tw = 0.5 + 0.5 * sin(uTime * 2.2 * aSpeed + aPhase * 12.0);
    vAlpha = 0.25 + 0.75 * tw;

    gl_PointSize = aSize * uPixelRatio * (90.0 / -mvPosition.z);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    // Soft round sprite
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export default function DataStreams({
    count = 1300,
    innerRadius = 9.5,
    outerRadius = 12.2,
    color = '#3fd0ff',
}: {
    count?: number;
    innerRadius?: number;
    outerRadius?: number;
    color?: string;
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null!);

    const { positions, phases, speeds, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const speeds = new Float32Array(count);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Bias toward the surface for a denser low "data layer".
            const r = innerRadius + Math.pow(Math.random(), 1.7) * (outerRadius - innerRadius);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            phases[i] = Math.random() * Math.PI * 2;
            // Differential rotation: nearer points flow faster
            speeds[i] = (0.04 + Math.random() * 0.10) * (Math.random() > 0.5 ? 1 : -1);
            sizes[i] = 0.5 + Math.random() * 1.6;
        }
        return { positions, phases, speeds, sizes };
    }, [count, innerRadius, outerRadius]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1.5, 1.5) },
    }), [color]);

    useFrame((state) => {
        if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
                <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={matRef}
                vertexShader={VERT}
                fragmentShader={FRAG}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
