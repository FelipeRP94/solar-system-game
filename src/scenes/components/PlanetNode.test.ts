import { describe, expect, it } from "vitest";
import { PLANETS_BY_ID } from "@/domain/planets/planetService";
import { getPlanetVisualRadius } from "./planetVisualScale";

describe("getPlanetVisualRadius", () => {
  it("keeps every planet visible while preserving relative size", () => {
    const mercury = getPlanetVisualRadius(PLANETS_BY_ID.get("mercury")!);
    const earth = getPlanetVisualRadius(PLANETS_BY_ID.get("earth")!);
    const jupiter = getPlanetVisualRadius(PLANETS_BY_ID.get("jupiter")!);

    expect(mercury).toBeGreaterThanOrEqual(0.42);
    expect(jupiter).toBeGreaterThan(earth);
    expect(jupiter).toBeLessThanOrEqual(1.65);
  });
});
