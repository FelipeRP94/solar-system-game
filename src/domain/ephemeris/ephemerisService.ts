import { Body, HelioVector } from "astronomy-engine";
import { auToSceneDistance } from "./distanceScale";
import type { PlanetPosition } from "./types";

const bodies: Record<string, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  earth: Body.Earth,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};

export const calculatePlanetPositions = (
  date: Date = new Date(),
): PlanetPosition[] => {
  return Object.entries(bodies).map(([planetId, body]) => {
    const vector = HelioVector(body, date);
    const distanceAU = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    const angle = Math.atan2(vector.z, vector.x);
    const sceneDistance = auToSceneDistance(distanceAU);
    return {
      planetId,
      realAngleRad: angle,
      realDistanceAU: distanceAU,
      sceneDistance,
      x: Math.cos(angle) * sceneDistance,
      z: Math.sin(angle) * sceneDistance,
    };
  });
};
