import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { PlanetPosition } from "@/domain/ephemeris/types";

export const getOrbitRingGeometry = (radius: number) => ({
  innerRadius: radius - 0.12,
  outerRadius: radius + 0.12,
  segments: 192,
  center: [0, 0, 0] as const,
});

export const OrbitRing = ({
  radius,
  positionsRef,
  isAnimatingRef,
  positionIndex,
}: {
  radius: number;
  positionsRef: MutableRefObject<PlanetPosition[]>;
  isAnimatingRef: MutableRefObject<boolean>;
  positionIndex: number;
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = getOrbitRingGeometry(radius);
  useFrame(() => {
    if (!isAnimatingRef.current) return;
    const position = positionsRef.current[positionIndex];
    if (position && mesh.current) {
      mesh.current.scale.setScalar(position.sceneDistance / radius);
    }
  });
  return (
    <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[geometry.innerRadius, geometry.outerRadius, geometry.segments]} />
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
