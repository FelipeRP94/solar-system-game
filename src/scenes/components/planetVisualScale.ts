import type { Planet } from "@/domain/planets/types";

const EARTH_RADIUS_KM = 6371;
const MIN_PLANET_VISUAL_RADIUS = 0.42;
const MAX_PLANET_VISUAL_RADIUS = 1.65;

export const getPlanetVisualRadius = ({
  radiusKm,
}: Pick<Planet, "radiusKm">): number =>
  Math.min(
    MAX_PLANET_VISUAL_RADIUS,
    Math.max(
      MIN_PLANET_VISUAL_RADIUS,
      0.56 * (radiusKm / EARTH_RADIUS_KM) ** 0.42,
    ),
  );
