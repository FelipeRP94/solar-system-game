import { describe, expect, it } from "vitest";
import {
  calculatePlanetOrbits,
  calculatePlanetPositions,
} from "./ephemerisService";

const NASA_ORBIT_ELEMENTS = [
  ["mercury", 0.206, 7.0],
  ["venus", 0.007, 3.4],
  ["earth", 0.017, 0],
  ["mars", 0.094, 1.8],
  ["jupiter", 0.049, 1.3],
  ["saturn", 0.052, 2.5],
  ["uranus", 0.047, 0.8],
  ["neptune", 0.01, 1.8],
] as const;

describe("ephemerisService", () => {
  it("calculates the same date deterministically", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    const first = calculatePlanetPositions(date);
    const second = calculatePlanetPositions(date);

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(
      first.every(
        (position) =>
          Number.isFinite(position.x) && Number.isFinite(position.y),
      ),
    ).toBe(true);
  });

  it("produces a changed ephemeris frame for a later date", () => {
    const first = calculatePlanetPositions(new Date("2025-01-01T00:00:00.000Z"));
    const later = calculatePlanetPositions(new Date("2025-01-11T00:00:00.000Z"));

    expect(later.some((position, index) => position.x !== first[index].x)).toBe(true);
  });

  it("samples closed 3D orbits matching NASA eccentricities and inclinations", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    const positions = calculatePlanetPositions(date);
    const orbits = calculatePlanetOrbits(date);

    expect(orbits).toHaveLength(NASA_ORBIT_ELEMENTS.length);

    NASA_ORBIT_ELEMENTS.forEach(([planetId, expectedEccentricity, expectedInclination]) => {
      const orbit = orbits.find((candidate) => candidate.planetId === planetId)!;
      const radii = orbit.points.map((point) => point.realDistanceAU);
      const minimumRadius = Math.min(...radii);
      const maximumRadius = Math.max(...radii);
      const eccentricity =
        (maximumRadius - minimumRadius) / (maximumRadius + minimumRadius);
      const inclination = Math.max(
        ...orbit.points.map(
          (point) =>
            (Math.asin(Math.abs(point.y) / point.sceneDistance) * 180) /
            Math.PI,
        ),
      );

      expect(orbit.points).toHaveLength(256);
      expect(eccentricity).toBeCloseTo(expectedEccentricity, 2);
      expect(inclination).toBeCloseTo(expectedInclination, 0);
      expect(orbit.points[128]).toEqual(
        positions.find((position) => position.planetId === planetId),
      );
    });
  });
});
