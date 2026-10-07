export type PlanetPosition = {
  planetId: string;
  realDistanceAU: number;
  sceneDistance: number;
  x: number;
  y: number;
  z: number;
};

export type PlanetOrbit = {
  planetId: string;
  points: PlanetPosition[];
};
