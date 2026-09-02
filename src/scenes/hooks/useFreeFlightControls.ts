"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_SCENE_DISTANCE } from "@/domain/ephemeris/distanceScale";
export const useFreeFlightControls = () => {
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.code);
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return (delta: number) => {
    const direction = new THREE.Vector3(
      (keys.current.has("KeyD") ? 1 : 0) - (keys.current.has("KeyA") ? 1 : 0),
      (keys.current.has("KeyE") ? 1 : 0) - (keys.current.has("KeyQ") ? 1 : 0),
      (keys.current.has("KeyS") ? 1 : 0) - (keys.current.has("KeyW") ? 1 : 0),
    );
    if (!direction.lengthSq()) return null;
    const speed =
      keys.current.has("ShiftLeft") || keys.current.has("ShiftRight")
        ? MAX_SCENE_DISTANCE / 60
        : MAX_SCENE_DISTANCE / 120;
    return direction.normalize().multiplyScalar(speed * delta);
  };
};
