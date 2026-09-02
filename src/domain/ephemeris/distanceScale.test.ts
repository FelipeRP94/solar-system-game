import { describe, expect, it } from "vitest";
import {
  auToSceneDistance,
  MAX_SCENE_DISTANCE,
  worstCaseSceneDistance,
} from "./distanceScale";
describe("distanceScale", () => {
  it("maps zero to the Sun and Neptune to the scene edge", () => {
    expect(auToSceneDistance(0)).toBe(0);
    expect(auToSceneDistance(30.1)).toBeCloseTo(MAX_SCENE_DISTANCE);
  });
  it("covers the opposition worst case", () => {
    expect(worstCaseSceneDistance()).toBeGreaterThan(MAX_SCENE_DISTANCE);
  });
});
