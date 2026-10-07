import type { PlanetId } from "@/domain/planets/planetService";

export const PLANET_TEXTURES: Record<PlanetId, string> = {
  mercury: "/textures/planets/mercury-4k.webp",
  venus: "/textures/planets/venus-surface-4k.webp",
  earth: "/textures/planets/earth-daymap-4k.webp",
  mars: "/textures/planets/mars-4k.webp",
  jupiter: "/textures/planets/jupiter-4k.webp",
  saturn: "/textures/planets/saturn-4k.webp",
  uranus: "/textures/planets/uranus-2k.jpg",
  neptune: "/textures/planets/neptune-2k.jpg",
};

export const SUN_TEXTURE = "/textures/planets/sun-4k.webp";

export const SATURN_RING_TEXTURE =
  "/textures/planets/saturn-ring-alpha-4k.png";
