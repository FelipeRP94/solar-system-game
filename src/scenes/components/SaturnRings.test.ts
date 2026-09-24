import { describe, expect, it } from "vitest";
import { getSaturnRingGeometry } from "./SaturnRings";

describe("getSaturnRingGeometry", () => {
  it("maps the texture radius across a wide annulus", () => {
    const geometry = getSaturnRingGeometry(1);
    const uvs = geometry.getAttribute("uv");

    expect(geometry.parameters.innerRadius).toBeCloseTo(1.15);
    expect(geometry.parameters.outerRadius).toBeCloseTo(2.4);
    expect(geometry.parameters.thetaSegments).toBe(256);
    expect(uvs.getX(0)).toBeCloseTo(0);
    expect(uvs.getX(uvs.count - 1)).toBeCloseTo(1);
    expect(uvs.getY(0)).toBe(0.5);
  });
});
