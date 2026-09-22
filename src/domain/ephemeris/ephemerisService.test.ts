import { describe, expect, it } from "vitest";
import { calculatePlanetPositions } from "./ephemerisService";

describe("ephemerisService", () => {
  it("calculates the same date deterministically", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    const first = calculatePlanetPositions(date);
    const second = calculatePlanetPositions(date);

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(first.every((position) => Number.isFinite(position.x))).toBe(true);
  });

  it("produces a changed ephemeris frame for a later date", () => {
    const first = calculatePlanetPositions(new Date("2025-01-01T00:00:00.000Z"));
    const later = calculatePlanetPositions(new Date("2025-01-11T00:00:00.000Z"));

    expect(later.some((position, index) => position.x !== first[index].x)).toBe(true);
  });
});
