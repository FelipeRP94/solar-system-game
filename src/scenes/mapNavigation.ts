import { MAX_SCENE_DISTANCE } from "@/domain/ephemeris/distanceScale";
import * as THREE from "three";

export type MapNavigationBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

type MapControlsChangeEvent = {
  target?: {
    object: { position: { x: number; y: number; z: number } };
    target: { x: number; y: number; z: number };
  };
};

const MAP_EDGE_MARGIN = 4;

export const MAP_NAVIGATION_BOUNDS: MapNavigationBounds = {
  minX: -MAX_SCENE_DISTANCE - MAP_EDGE_MARGIN,
  maxX: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
  minY: 2,
  maxY: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
  minZ: -MAX_SCENE_DISTANCE - MAP_EDGE_MARGIN,
  maxZ: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
};

export const MIN_ZOOM_DISTANCE = 4;
export const MAX_ZOOM_DISTANCE = MAX_SCENE_DISTANCE * 2;
export const DRAG_THRESHOLD_PX = 5;

export const MAP_CONTROL_HELP = [
  "Botón izquierdo: rotar",
  "Botón derecho: mover",
  "Botón central: dolly",
  "Rueda: zoom",
  "WASD: mover nave",
] as const;

export const MAP_ORBIT_CONTROLS = {
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
  minDistance: MIN_ZOOM_DISTANCE,
  maxDistance: MAX_ZOOM_DISTANCE,
  mouseButtons: {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  },
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const clampCameraPair = (
  camera: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  bounds: MapNavigationBounds,
): void => {
  const nextCamera = {
    x: clamp(camera.x, bounds.minX, bounds.maxX),
    y: clamp(camera.y, bounds.minY, bounds.maxY),
    z: clamp(camera.z, bounds.minZ, bounds.maxZ),
  };
  const delta = {
    x: nextCamera.x - camera.x,
    y: nextCamera.y - camera.y,
    z: nextCamera.z - camera.z,
  };

  camera.x += delta.x;
  camera.y += delta.y;
  camera.z += delta.z;
  target.x += delta.x;
  target.y += delta.y;
  target.z += delta.z;
};

export const clampMapControlsChange = (
  event: MapControlsChangeEvent | undefined,
  bounds: MapNavigationBounds = MAP_NAVIGATION_BOUNDS,
): void => {
  if (!event?.target) return;

  clampCameraPair(
    event.target.object.position,
    event.target.target,
    bounds,
  );
};

export const isWithinDragThreshold = (delta: number): boolean =>
  delta <= DRAG_THRESHOLD_PX;

export const resetMapCamera = (controls: { reset: () => void }): void => {
  controls.reset();
};
