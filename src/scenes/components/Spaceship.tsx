import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useFreeFlightControls } from "../hooks/useFreeFlightControls";
export const Spaceship = ({
  onMove,
}: {
  onMove: (position: THREE.Vector3) => void;
  positionRef: React.MutableRefObject<THREE.Vector3>;
}) => {
  const group = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3(0, 0, 4));
  const move = useFreeFlightControls();
  useFrame((_, delta) => {
    const change = move(delta);
    if (change) {
      position.current.add(change);
      if (position.current.length() < 2.4) position.current.setLength(2.4);
      position.current.x = THREE.MathUtils.clamp(position.current.x, -45, 45);
      position.current.y = THREE.MathUtils.clamp(position.current.y, -18, 18);
      position.current.z = THREE.MathUtils.clamp(position.current.z, -45, 45);
      onMove(position.current.clone());
    }
    if (group.current) group.current.position.copy(position.current);
  });
  return (
    <group ref={group}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.45, 1.8, 4]} />
        <meshStandardMaterial color="#f3f7ff" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.5, 0.08, 1]} />
        <meshStandardMaterial color="#4dd8ff" emissive="#116080" />
      </mesh>
    </group>
  );
};
