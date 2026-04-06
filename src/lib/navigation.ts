import * as THREE from 'three';

export interface NavPoint {
  lat: number;
  lon: number;
  label: string;
}

export interface RouteDefinition {
  origin: NavPoint;
  dest: NavPoint;
}

export interface NavRoute {
  curve: THREE.CatmullRomCurve3;
  line: THREE.Line;
  origin: THREE.Vector3;
  dest: THREE.Vector3;
}

export function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function makeNavRoute(route: RouteDefinition, radius = 6.52): NavRoute {
  const origin = latLonToVector3(route.origin.lat, route.origin.lon, radius);
  const dest = latLonToVector3(route.dest.lat, route.dest.lon, radius);
  const points: THREE.Vector3[] = [];
  const segments = 120;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const point = origin.clone().lerp(dest, t).normalize().multiplyScalar(radius + 0.08);
    points.push(point);
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.9);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    color: 0x7de2ff,
    transparent: true,
    opacity: 0.55,
    toneMapped: false,
    depthTest: false,
  });

  const line = new THREE.Line(geometry, material);
  line.renderOrder = 150;

  return { curve, line, origin, dest };
}
