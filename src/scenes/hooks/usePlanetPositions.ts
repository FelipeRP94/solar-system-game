"use client";
import { useState } from "react";
import { calculatePlanetPositions } from "@/domain/ephemeris/ephemerisService";
export const usePlanetPositions = () => {
  const [positions] = useState(() => calculatePlanetPositions());
  return positions;
};
