export const MAX_SCENE_DISTANCE = 60;
export const MAX_ORBIT_AU = 30.1;

export const auToSceneDistance = (distanceAU: number): number => {
  const normalized = Math.max(0, distanceAU) / MAX_ORBIT_AU;
  return Math.sqrt(normalized) * MAX_SCENE_DISTANCE;
};

export const worstCaseSceneDistance = (
  innerAU = 0.307,
  outerAU = 30.33,
): number => {
  return auToSceneDistance(innerAU) + auToSceneDistance(outerAU);
};
