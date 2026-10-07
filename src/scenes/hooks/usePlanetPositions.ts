"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  calculatePlanetOrbits,
  calculatePlanetPositions,
} from "@/domain/ephemeris/ephemerisService";
import type { PlanetPosition } from "@/domain/ephemeris/types";
const MAX_FRAME_DELTA_SECONDS = 1;
const POSITIONS_UPDATE_INTERVAL_SECONDS = 1 / 15;
export const BASE_SIMULATED_DAYS_PER_SECOND = 10;

type PlanetPositionOptions = {
  speed?: number;
  paused?: boolean;
  speedRef?: MutableRefObject<number>;
  pausedRef?: MutableRefObject<boolean>;
};

export const clampFrameDelta = (deltaSeconds: number): number =>
  Math.min(Math.max(deltaSeconds, 0), MAX_FRAME_DELTA_SECONDS);

export const speedToSimulatedDays = (speed: number): number =>
  Math.min(Math.max(speed, 0), 10) * BASE_SIMULATED_DAYS_PER_SECOND;

export const interpolatePlanetPositions = (
  positions: PlanetPosition[],
  startPositions: PlanetPosition[],
  targetPositions: PlanetPosition[],
  progress: number,
): void => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  positions.forEach((position, index) => {
    const start = startPositions[index];
    const target = targetPositions[index];
    if (!start || !target) return;

    position.realDistanceAU =
      start.realDistanceAU +
      (target.realDistanceAU - start.realDistanceAU) *
        clampedProgress;
    position.sceneDistance =
      start.sceneDistance +
      (target.sceneDistance - start.sceneDistance) *
        clampedProgress;
    position.x = start.x + (target.x - start.x) * clampedProgress;
    position.y = start.y + (target.y - start.y) * clampedProgress;
    position.z = start.z + (target.z - start.z) * clampedProgress;
  });
};

export const advanceSimulationDate = (
  date: Date,
  speed: number,
  deltaSeconds: number,
): Date => {
  const simulatedDays = speedToSimulatedDays(speed) * clampFrameDelta(deltaSeconds);
  return new Date(date.getTime() + simulatedDays * 24 * 60 * 60 * 1000);
};

export const usePlanetPositions = (options: PlanetPositionOptions = {}) => {
  const { pausedRef, speedRef } = options;
  const [initialDate] = useState(() => new Date());
  const date = useRef(initialDate);
  const speed = useRef(options.speed ?? 1);
  const paused = useRef(options.paused ?? false);
  const isAnimatingRef = useRef(true);
  const elapsedSinceUpdate = useRef(POSITIONS_UPDATE_INTERVAL_SECONDS);
  const [positions] = useState(() => calculatePlanetPositions(initialDate));
  const [orbits] = useState(() => calculatePlanetOrbits(initialDate));
  const positionsRef = useRef(positions);
  const [speedValue, setSpeedValue] = useState(options.speed ?? 1);
  const [pausedValue, setPausedValue] = useState(options.paused ?? false);
  const startPositionsRef = useRef(
    positions.map((position) => ({ ...position })),
  );
  const targetPositionsRef = useRef(
    positions.map((position) => ({ ...position })),
  );
  useEffect(() => {
    if (speedRef || pausedRef) return;
    speed.current = options.speed ?? 1;
    paused.current = options.paused ?? false;
    setSpeedValue(speed.current);
    setPausedValue(paused.current);
  }, [options.paused, options.speed, pausedRef, speedRef]);

  useFrame((_, delta) => {
    const currentSpeed = speedRef?.current ?? speed.current;
    const isPaused = pausedRef?.current ?? paused.current;
    isAnimatingRef.current = !isPaused && currentSpeed !== 0;
    if (!isAnimatingRef.current) return;
    date.current = advanceSimulationDate(date.current, currentSpeed, delta);
    elapsedSinceUpdate.current += clampFrameDelta(delta);
    if (elapsedSinceUpdate.current >= POSITIONS_UPDATE_INTERVAL_SECONDS) {
      startPositionsRef.current = positionsRef.current.map((position) => ({
        ...position,
      }));
      targetPositionsRef.current = calculatePlanetPositions(date.current);
      elapsedSinceUpdate.current = 0;
    }

    interpolatePlanetPositions(
      positionsRef.current,
      startPositionsRef.current,
      targetPositionsRef.current,
      elapsedSinceUpdate.current / POSITIONS_UPDATE_INTERVAL_SECONDS,
    );
  });

  const setSpeed = (nextSpeed: number) => {
    const next = Math.min(Math.max(nextSpeed, 0), 10);
    speed.current = next;
    if (speedRef) speedRef.current = next;
    isAnimatingRef.current = next !== 0 && !paused.current;
    setSpeedValue(next);
  };

  const togglePause = () => {
    paused.current = !paused.current;
    if (pausedRef) pausedRef.current = paused.current;
    isAnimatingRef.current = !paused.current && speed.current !== 0;
    setPausedValue(paused.current);
  };

  return {
    positions,
    orbits,
    positionsRef,
    isAnimatingRef,
    speed: speedValue,
    setSpeed,
    paused: pausedValue,
    togglePause,
  };
};
