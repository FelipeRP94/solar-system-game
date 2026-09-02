import { describe, expect, it } from "vitest";
import { PLANET_IDS } from "@/domain/planets/planetService";
import {
  PLANET_TEXTURES,
  SATURN_RING_TEXTURE,
  SUN_TEXTURE,
} from "./planetTextures";

describe("planet texture manifest", () => {
  it("provides one local texture for every supported planet", () => {
    expect(Object.keys(PLANET_TEXTURES)).toEqual([...PLANET_IDS]);
    expect(Object.values(PLANET_TEXTURES)).toHaveLength(PLANET_IDS.length);
    expect(Object.values(PLANET_TEXTURES).every((url) => url.startsWith("/textures/planets/"))).toBe(true);
  });

  it("keeps the Saturn ring texture local", () => {
    expect(SATURN_RING_TEXTURE).toBe(
      "/textures/planets/saturn-ring-alpha-2k.png",
    );
  });

  it("provides the local Sun texture", () => {
    expect(SUN_TEXTURE).toBe("/textures/planets/sun-2k.jpg");
  });
});
