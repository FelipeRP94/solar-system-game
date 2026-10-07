const VISUAL_ROTATION_TIME_SCALE = 0.005;

export const getPlanetSpinRadiansPerSecond = (
  rotationPeriodHours: number,
  simulatedDaysPerSecond: number,
): number => {
  if (rotationPeriodHours === 0) return 0;

  return (
    (simulatedDaysPerSecond *
      VISUAL_ROTATION_TIME_SCALE *
      24 *
      Math.PI *
      2) /
    Math.abs(rotationPeriodHours)
  );
};
