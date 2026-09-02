export type Planet = {
  id: string;
  name: string;
  color: string;
  radiusKm: number;
  distanceFromSunAU: number;
  distanceFromEarthMillionKm: number;
  temperatureC: number;
  gravityMs2: number;
  moons: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  atmosphere: { gas: string; percentage: number }[];
  description: string;
};
