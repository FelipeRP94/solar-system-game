import { Vector3 } from "three";
import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  DRAG_THRESHOLD_PX,
  MAP_NAVIGATION_BOUNDS,
  MAP_ORBIT_CONTROLS,
  MAX_ZOOM_DISTANCE,
  MIN_ZOOM_DISTANCE,
  clampCameraPair,
  clampMapControlsChange,
  isWithinDragThreshold,
  MAP_CONTROL_HELP,
  resetMapCamera,
} from "./mapNavigation";

describe("mapNavigation", () => {
  it("translates both camera vectors back inside every map boundary", () => {
    const camera = new Vector3(60, 50, -60);
    const target = new Vector3(50, 40, -50);
    const bounds = {
      minX: -20,
      maxX: 20,
      minY: 0,
      maxY: 20,
      minZ: -20,
      maxZ: 20,
    };

    clampCameraPair(camera, target, bounds);

    expect(camera).toEqual(new Vector3(20, 20, -20));
    expect(target).toEqual(new Vector3(10, 10, -10));
  });

  it("preserves camera-to-target separation while clamping an edge case", () => {
    const camera = new Vector3(-30, 5, 25);
    const target = new Vector3(-40, 0, 15);
    const separation = camera.clone().sub(target);
    const bounds = {
      minX: -20,
      maxX: 20,
      minY: 0,
      maxY: 20,
      minZ: -20,
      maxZ: 20,
    };

    clampCameraPair(camera, target, bounds);

    expect(camera.x).toBe(-20);
    expect(target.x).toBe(-30);
    expect(camera.clone().sub(target)).toEqual(separation);
  });

  it("defines usable scene bounds and ordered zoom limits", () => {
    expect(MAP_NAVIGATION_BOUNDS.minX).toBeLessThan(MAP_NAVIGATION_BOUNDS.maxX);
    expect(MAP_NAVIGATION_BOUNDS.minY).toBeLessThan(MAP_NAVIGATION_BOUNDS.maxY);
    expect(MAP_NAVIGATION_BOUNDS.minZ).toBeLessThan(MAP_NAVIGATION_BOUNDS.maxZ);
    expect(MIN_ZOOM_DISTANCE).toBeGreaterThan(0);
    expect(MAX_ZOOM_DISTANCE).toBeGreaterThan(MIN_ZOOM_DISTANCE);
  });

  it("defines bounded controls with explicit mouse gesture mappings", () => {
    expect(MAP_ORBIT_CONTROLS).toMatchObject({
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
    });
  });

  it("keeps rotation, pan, and dolly gestures assigned to distinct buttons", () => {
    expect(MAP_ORBIT_CONTROLS.mouseButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    expect(MAP_ORBIT_CONTROLS.mouseButtons.RIGHT).toBe(THREE.MOUSE.PAN);
    expect(MAP_ORBIT_CONTROLS.mouseButtons.MIDDLE).toBe(THREE.MOUSE.DOLLY);
  });

  it("accepts zero and threshold drag deltas but rejects larger movement", () => {
    expect(isWithinDragThreshold(0)).toBe(true);
    expect(isWithinDragThreshold(DRAG_THRESHOLD_PX)).toBe(true);
    expect(isWithinDragThreshold(DRAG_THRESHOLD_PX + 0.01)).toBe(false);
  });

  it("describes every map gesture and keyboard movement in the help contract", () => {
    expect(MAP_CONTROL_HELP).toEqual([
      "Botón izquierdo: rotar",
      "Botón derecho: mover",
      "Botón central: dolly",
      "Rueda: zoom",
      "WASD: mover nave",
    ]);
  });

  it("resets the existing OrbitControls instance", () => {
    let resetCount = 0;

    resetMapCamera({
      reset: () => {
        resetCount += 1;
      },
    });

    expect(resetCount).toBe(1);
  });

  it("ignores an undefined OrbitControls change event", () => {
    expect(() => clampMapControlsChange(undefined)).not.toThrow();
  });

  it("clamps camera controls when a change event has a target", () => {
    const camera = new Vector3(30, 30, 30);
    const target = new Vector3(20, 20, 20);

    clampMapControlsChange(
      { target: { object: { position: camera }, target } },
      { minX: -20, maxX: 20, minY: 0, maxY: 20, minZ: -20, maxZ: 20 },
    );

    expect(camera).toEqual(new Vector3(20, 20, 20));
    expect(target).toEqual(new Vector3(10, 10, 10));
  });
});
