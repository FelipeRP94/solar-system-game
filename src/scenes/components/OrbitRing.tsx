import { useMemo } from "react";
import * as THREE from "three";
import type { PlanetPosition } from "@/domain/ephemeris/types";

const ORBIT_LINE_RADIUS = 0.055;

export const getOrbitPathGeometry = (points: PlanetPosition[]) => {
  const curve = new THREE.CatmullRomCurve3(
    points.map(({ x, y, z }) => new THREE.Vector3(x, y, z)),
    true,
    "centripetal",
  );

  return new THREE.TubeGeometry(
    curve,
    points.length * 2,
    ORBIT_LINE_RADIUS,
    6,
    true,
  );
};

export const OrbitRing = ({ points }: { points: PlanetPosition[] }) => {
  const geometry = useMemo(() => getOrbitPathGeometry(points), [points]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#c5e3ff"
        fog={false}
        toneMapped={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
