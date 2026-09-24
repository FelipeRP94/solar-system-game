import {
  Body,
  HelioVector,
  RotateVector,
  Rotation_EQJ_ECL,
} from "astronomy-engine";
import { PLANETS_BY_ID, type PlanetId } from "@/domain/planets/planetService";
import { auToSceneDistance } from "./distanceScale";
import type { PlanetOrbit, PlanetPosition } from "./types";

const bodies: ReadonlyArray<readonly [PlanetId, Body]> = [
  ["mercury", Body.Mercury],
  ["venus", Body.Venus],
  ["earth", Body.Earth],
  ["mars", Body.Mars],
  ["jupiter", Body.Jupiter],
  ["saturn", Body.Saturn],
  ["uranus", Body.Uranus],
  ["neptune", Body.Neptune],
];

const ORBIT_SAMPLE_COUNT = 256;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const equatorialToEcliptic = Rotation_EQJ_ECL();

const calculatePlanetPosition = (
  planetId: PlanetId,
  body: Body,
  date: Date,
): PlanetPosition => {
  const vector = RotateVector(equatorialToEcliptic, HelioVector(body, date));
  const distanceAU = Math.hypot(vector.x, vector.y, vector.z);
  const sceneDistance = auToSceneDistance(distanceAU);
  const sceneScale = sceneDistance / distanceAU;

  return {
    planetId,
    realDistanceAU: distanceAU,
    sceneDistance,
    x: vector.x * sceneScale,
    y: vector.z * sceneScale,
    z: vector.y * sceneScale,
  };
};

export const calculatePlanetPositions = (
  date: Date = new Date(),
): PlanetPosition[] => {
  return bodies.map(([planetId, body]) =>
    calculatePlanetPosition(planetId, body, date),
  );
};

export const calculatePlanetOrbits = (
  date: Date = new Date(),
): PlanetOrbit[] =>
  bodies.map(([planetId, body]) => {
    const periodDays = PLANETS_BY_ID.get(planetId)!.orbitalPeriodDays;
    const startTime = date.getTime() - (periodDays * MILLISECONDS_PER_DAY) / 2;

    return {
      planetId,
      points: Array.from({ length: ORBIT_SAMPLE_COUNT }, (_, index) => {
        const sampleDate = new Date(
          startTime +
            (periodDays * MILLISECONDS_PER_DAY * index) / ORBIT_SAMPLE_COUNT,
        );
        return calculatePlanetPosition(planetId, body, sampleDate);
      }),
    };
  });
