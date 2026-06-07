import { Component, Suspense, type ReactNode } from 'react';
import * as THREE from 'three';
import MorphingHeroDrone from './MorphingHeroDrone';
import GLTFHeroDrone from './GLTFHeroDrone';

/**
 * Error boundary that swaps to the procedural drone if the GLTF model is
 * missing or fails to load. Keeps the hero working with zero assets while
 * upgrading automatically the moment `public/models/drone.glb` exists.
 */
class DroneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch() {
        // Silent: the procedural fallback is a fully valid drone.
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

export default function HeroDrone({ pointer }: { pointer?: THREE.Vector2 }) {
    return (
        <DroneBoundary fallback={<MorphingHeroDrone pointer={pointer} />}>
            <Suspense fallback={null}>
                <GLTFHeroDrone pointer={pointer} />
            </Suspense>
        </DroneBoundary>
    );
}
