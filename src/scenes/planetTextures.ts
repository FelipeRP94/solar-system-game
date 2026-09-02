import type { PlanetId } from "@/domain/planets/planetService";

export const PLANET_TEXTURES: Record<PlanetId, string> = {
  mercury: "/textures/planets/mercury-2k.jpg",
  venus: "/textures/planets/venus-surface-2k.jpg",
  earth: "/textures/planets/earth-daymap-2k.jpg",
  mars: "/textures/planets/mars-2k.jpg",
  jupiter: "/textures/planets/jupiter-2k.jpg",
  saturn: "/textures/planets/saturn-2k.jpg",
  uranus: "/textures/planets/uranus-2k.jpg",
  neptune: "/textures/planets/neptune-2k.jpg",
};

export const SUN_TEXTURE = "/textures/planets/sun-2k.jpg";

export const SATURN_RING_TEXTURE =
  "/textures/planets/saturn-ring-alpha-2k.png";
