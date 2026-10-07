import { describe, expect, it } from "vitest";
import { getPlanetSpinRadiansPerSecond } from "./planetRotation";

describe("getPlanetSpinRadiansPerSecond", () => {
  it("preserves relative rotation periods while pausing at zero speed", () => {
    const earth = getPlanetSpinRadiansPerSecond(24, 10);
    const jupiter = getPlanetSpinRadiansPerSecond(9.93, 10);
    const venus = getPlanetSpinRadiansPerSecond(-5832.5, 10);

    expect(earth).toBeCloseTo((Math.PI * 2) / 20);
    expect(jupiter).toBeGreaterThan(earth);
    expect(venus).toBeGreaterThan(0);
    expect(getPlanetSpinRadiansPerSecond(24, 0)).toBe(0);
  });
});
