import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { PlanetPosition } from "@/domain/ephemeris/types";
import { getOrbitPathGeometry } from "./OrbitRing";

describe("OrbitRing", () => {
  it("builds a closed 3D path from the inclined ephemeris samples", () => {
    const points = [
      { x: 4, y: 0, z: 0 },
      { x: 0, y: 0.5, z: 3 },
      { x: -3, y: 0, z: 0 },
      { x: 0, y: -0.5, z: -4 },
    ] as PlanetPosition[];
    const geometry = getOrbitPathGeometry(points);
    const path = geometry.parameters.path as THREE.CatmullRomCurve3;

    expect(geometry.parameters.closed).toBe(true);
    expect(geometry.parameters.tubularSegments).toBe(points.length * 2);
    expect(path.points.some((point) => point.y !== 0)).toBe(true);

    geometry.dispose();
  });
});
