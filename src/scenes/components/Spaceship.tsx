import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useFreeFlightControls } from "../hooks/useFreeFlightControls";
import { MAX_SCENE_DISTANCE } from "@/domain/ephemeris/distanceScale";

export type ShipOrientation = {
  yaw: number;
  pitch: number;
};

export const Spaceship = ({
  onMove,
  orientationRef,
  relativeToCamera,
}: {
  onMove: (position: THREE.Vector3) => void;
  orientationRef: React.MutableRefObject<ShipOrientation>;
  relativeToCamera: boolean;
}) => {
  const group = useRef<THREE.Group>(null);
  const position = useRef(new THREE.Vector3(0, 0, 4));
  const rotation = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const move = useFreeFlightControls();
  useFrame((_, delta) => {
    if (relativeToCamera) {
      const { yaw, pitch } = orientationRef.current;
      rotation.current.set(pitch, yaw, 0);
    }

    const change = move(delta);
    if (change) {
      if (relativeToCamera) {
        change.applyEuler(rotation.current);
      }
      position.current.add(change);
      if (position.current.length() < 2.4) position.current.setLength(2.4);
      position.current.x = THREE.MathUtils.clamp(
        position.current.x,
        -MAX_SCENE_DISTANCE - 4,
        MAX_SCENE_DISTANCE + 4,
      );
      position.current.y = THREE.MathUtils.clamp(position.current.y, -18, 18);
      position.current.z = THREE.MathUtils.clamp(
        position.current.z,
        -MAX_SCENE_DISTANCE - 4,
        MAX_SCENE_DISTANCE + 4,
      );
      onMove(position.current.clone());
    }
    if (group.current) {
      group.current.position.copy(position.current);
      group.current.rotation.copy(rotation.current);
    }
  });
  return (
    <group ref={group} visible={false}>
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
