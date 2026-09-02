import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
export const SpaceMapCameraRig = ({
  target,
}: {
  target: React.MutableRefObject<THREE.Vector3>;
}) => {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  useFrame(() => {
    desired.current.set(
      target.current.x + 6,
      target.current.y + 6,
      target.current.z + 9,
    );
    camera.position.lerp(desired.current, 0.08);
    camera.lookAt(target.current);
  });
  return null;
};
