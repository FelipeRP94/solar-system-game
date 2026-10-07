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

export const MAX_ZOOM_DISTANCE = MAX_SCENE_DISTANCE * 2;
const MAP_EDGE_MARGIN = MAX_ZOOM_DISTANCE + 4;

export const MAP_NAVIGATION_BOUNDS: MapNavigationBounds = {
  minX: -MAX_SCENE_DISTANCE - MAP_EDGE_MARGIN,
  maxX: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
  minY: -MAX_SCENE_DISTANCE - MAP_EDGE_MARGIN,
  maxY: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
  minZ: -MAX_SCENE_DISTANCE - MAP_EDGE_MARGIN,
  maxZ: MAX_SCENE_DISTANCE + MAP_EDGE_MARGIN,
};

export const MIN_ZOOM_DISTANCE = 0.1;
export const DRAG_THRESHOLD_PX = 5;
const CAMERA_SURFACE_CLEARANCE = 0.04;

export type CollisionSphere = {
  x: number;
  y: number;
  z: number;
  radius: number;
};

export const MAP_CONTROL_HELP = [
  "Botón izquierdo: rotar",
  "Botón derecho: mover",
  "Botón central: dolly",
  "Rueda: acercar al punto señalado",
  "WASD: mover nave",
] as const;

export const MAP_ORBIT_CONTROLS = {
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
  zoomToCursor: true,
  minDistance: MIN_ZOOM_DISTANCE,
  maxDistance: MAX_ZOOM_DISTANCE,
  zoomSpeed: 2.5,
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

export const clampCameraOutsideSpheres = (
  camera: { x: number; y: number; z: number },
  spheres: CollisionSphere[],
): void => {
  spheres.forEach((sphere) => {
    let x = camera.x - sphere.x;
    let y = camera.y - sphere.y;
    let z = camera.z - sphere.z;
    const minimumDistance = sphere.radius + CAMERA_SURFACE_CLEARANCE;
    const distance = Math.hypot(x, y, z);

    if (distance >= minimumDistance) return;
    if (distance === 0) {
      x = 0;
      y = 0;
      z = 1;
    } else {
      x /= distance;
      y /= distance;
      z /= distance;
    }

    camera.x = sphere.x + x * minimumDistance;
    camera.y = sphere.y + y * minimumDistance;
    camera.z = sphere.z + z * minimumDistance;
  });
};

export const clampMapControlsChange = (
  event: MapControlsChangeEvent | undefined,
  bounds: MapNavigationBounds = MAP_NAVIGATION_BOUNDS,
  collisionSpheres: CollisionSphere[] = [],
): void => {
  if (!event?.target) return;

  clampCameraPair(
    event.target.object.position,
    event.target.target,
    bounds,
  );
  const focus = event.target.target;
  clampCameraOutsideSpheres(
    event.target.object.position,
    collisionSpheres.filter(
      (sphere) =>
        Math.hypot(
          focus.x - sphere.x,
          focus.y - sphere.y,
          focus.z - sphere.z,
        ) <=
        sphere.radius + CAMERA_SURFACE_CLEARANCE,
    ),
  );
};

export const isWithinDragThreshold = (delta: number): boolean =>
  delta <= DRAG_THRESHOLD_PX;

export const resetMapCamera = (controls: { reset: () => void }): void => {
  controls.reset();
};
