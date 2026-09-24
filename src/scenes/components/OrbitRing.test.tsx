import { describe, expect, it } from "vitest";
import { getOrbitRingGeometry } from "./OrbitRing";

describe("OrbitRing", () => {
  it("keeps a circular radius and sun-centered position", () => {
    expect(getOrbitRingGeometry(12)).toEqual({
      innerRadius: 11.88,
      outerRadius: 12.12,
      segments: 192,
      center: [0, 0, 0],
    });
  });

  it("does not derive its radius from an animated planet position", () => {
    expect(getOrbitRingGeometry(12).outerRadius).toBeCloseTo(12.12);
    expect(getOrbitRingGeometry(12).outerRadius).not.toBeCloseTo(18);
  });
});
