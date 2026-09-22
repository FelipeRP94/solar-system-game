"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { calculatePlanetPositions } from "@/domain/ephemeris/ephemerisService";
const MAX_FRAME_DELTA_SECONDS = 1;
export const BASE_SIMULATED_DAYS_PER_SECOND = 10;

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

export const usePlanetPositions = (options: { speed?: number; paused?: boolean } = {}) => {
  const date = useRef(new Date());
  const speed = useRef(options.speed ?? 1);
  const paused = useRef(options.paused ?? false);
  const [positions, setPositions] = useState(() => calculatePlanetPositions());
  const [speedValue, setSpeedValue] = useState(options.speed ?? 1);
  const [pausedValue, setPausedValue] = useState(options.paused ?? false);
  useEffect(() => {
    speed.current = options.speed ?? 1;
    paused.current = options.paused ?? false;
    setSpeedValue(speed.current);
    setPausedValue(paused.current);
  }, [options.speed, options.paused]);

  useFrame((_, delta) => {
    if (paused.current || speed.current === 0) return;
    date.current = advanceSimulationDate(date.current, speed.current, delta);
    setPositions(calculatePlanetPositions(date.current));
  });

  const setSpeed = (nextSpeed: number) => {
    const next = Math.min(Math.max(nextSpeed, 0), 10);
    speed.current = next;
    setSpeedValue(next);
  };

  const togglePause = () => {
    paused.current = !paused.current;
    setPausedValue(paused.current);
  };

  return { positions, speed: speedValue, setSpeed, paused: pausedValue, togglePause };
};
