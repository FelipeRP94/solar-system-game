"use client";
import { create } from "zustand";
type AppState = {
  nearbyPlanetId: string | null;
  setNearbyPlanet: (id: string | null) => void;
};
export const useAppStore = create<AppState>((set) => ({
  nearbyPlanetId: null,
  setNearbyPlanet: (nearbyPlanetId) => set({ nearbyPlanetId }),
}));
