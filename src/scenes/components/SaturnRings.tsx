import { useMemo } from "react";
import * as THREE from "three";

const SATURN_RING_INCLINATION = (26.7 * Math.PI) / 180;

export const getSaturnRingGeometry = (radius: number): THREE.RingGeometry => {
  const innerRadius = radius * 1.15;
  const outerRadius = radius * 2.4;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 256);
  const positions = geometry.getAttribute("position");
  const uvs = geometry.getAttribute("uv");

  for (let index = 0; index < positions.count; index += 1) {
    const distance = Math.hypot(
      positions.getX(index),
      positions.getY(index),
    );
    uvs.setXY(index, (distance - innerRadius) / (outerRadius - innerRadius), 0.5);
  }

  uvs.needsUpdate = true;
  return geometry;
};

export const SaturnRings = ({
  radius,
  texture,
}: {
  radius: number;
  texture?: THREE.Texture;
}) => {
  const geometry = useMemo(() => getSaturnRingGeometry(radius), [radius]);

  return (
    <mesh
      geometry={geometry}
      rotation={[Math.PI / 2 + SATURN_RING_INCLINATION, 0, 0]}
    >
      <meshBasicMaterial
        color="#d8c393"
        alphaMap={texture}
        alphaTest={texture ? 0.04 : 0}
        transparent={Boolean(texture)}
        opacity={0.95}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};
