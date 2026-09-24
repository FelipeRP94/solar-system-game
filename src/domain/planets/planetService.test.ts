import { describe, expect, it } from "vitest";
import { PLANETS } from "./planetService";

describe("planet rotation data", () => {
  it("matches NASA rotation periods and axial tilts for all planets", () => {
    expect(
      PLANETS.map(({ id, rotationPeriodHours, axialTiltDegrees }) => [
        id,
        rotationPeriodHours,
        axialTiltDegrees,
      ]),
    ).toEqual([
      ["mercury", 1407.6, 0.034],
      ["venus", -5832.5, 177.4],
      ["earth", 23.93, 23.4],
      ["mars", 24.62, 25.2],
      ["jupiter", 9.93, 3.1],
      ["saturn", 10.7, 26.7],
      ["uranus", -17.24, 97.8],
      ["neptune", 16.11, 28.3],
    ]);
  });
});
