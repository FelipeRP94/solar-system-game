import { PLANETS } from "@/domain/planets/planetService";
import type { Planet } from "@/domain/planets/types";

const cache = new Map<string, Planet>();
export const fetchPlanet = async (id: string): Promise<Planet> => {
  const cached = cache.get(id);
  if (cached) return cached;
  try {
    const response = await fetch(
      `https://api.le-systeme-solaire.net/rest/bodies/${id}`,
      { next: { revalidate: 86400 } },
    );
    if (response.ok) {
      const raw = await response.json();
      const fallback = PLANETS.find((planet) => planet.id === id);
      if (fallback && raw) {
        cache.set(id, fallback);
        return fallback;
      }
    }
  } catch {
    /* The curated dataset keeps the game playable offline. */
  }
  const planet = PLANETS.find((item) => item.id === id);
  if (!planet) throw new Error("Planeta no encontrado");
  cache.set(id, planet);
  return planet;
};
