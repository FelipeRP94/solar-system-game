"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { calculatePlanetPositions } from "@/domain/ephemeris/ephemerisService";
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
  const date = useRef(new Date());
  const speed = useRef(options.speed ?? 1);
  const paused = useRef(options.paused ?? false);
  const isAnimatingRef = useRef(true);
  const elapsedSinceUpdate = useRef(POSITIONS_UPDATE_INTERVAL_SECONDS);
  const [positions] = useState(() => calculatePlanetPositions());
  const positionsRef = useRef(positions);
  const [speedValue, setSpeedValue] = useState(options.speed ?? 1);
  const [pausedValue, setPausedValue] = useState(options.paused ?? false);
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
    if (elapsedSinceUpdate.current < POSITIONS_UPDATE_INTERVAL_SECONDS) return;
    elapsedSinceUpdate.current = 0;
    positionsRef.current = calculatePlanetPositions(date.current);
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
    positionsRef,
    isAnimatingRef,
    speed: speedValue,
    setSpeed,
    paused: pausedValue,
    togglePause,
  };
};
