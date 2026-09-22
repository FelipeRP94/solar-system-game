import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  advanceSimulationDate,
  BASE_SIMULATED_DAYS_PER_SECOND,
  clampFrameDelta,
  speedToSimulatedDays,
  usePlanetPositions,
} from "./usePlanetPositions";

let frameCallback: (_state: unknown, delta: number) => void;
vi.mock("@react-three/fiber", () => ({
  useFrame: (callback: (_state: unknown, delta: number) => void) => {
    frameCallback = callback;
  },
}));

describe("usePlanetPositions simulation clock", () => {
  beforeEach(() => {
    frameCallback = () => undefined;
  });

  it("maps the continuous speed range to simulated days per second", () => {
    expect(speedToSimulatedDays(0)).toBe(0);
    expect(speedToSimulatedDays(1)).toBe(BASE_SIMULATED_DAYS_PER_SECOND);
    expect(speedToSimulatedDays(10)).toBe(100);
    expect(speedToSimulatedDays(4.5)).toBe(45);
  });

  it("advances by the requested rate and freezes at zero speed", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");

    expect(advanceSimulationDate(start, 1, 1).toISOString()).toBe(
      "2025-01-11T00:00:00.000Z",
    );
    expect(advanceSimulationDate(start, 0, 1)).toEqual(start);
  });

  it("clamps stalled frame deltas before advancing time", () => {
    expect(clampFrameDelta(0.25)).toBe(0.25);
    expect(clampFrameDelta(10)).toBe(1);
  });

  it("preserves speed while paused and resumes the same shared frame", () => {
    const { result } = renderHook(() => usePlanetPositions());
    const initialPositions = result.current.positions;

    act(() => result.current.setSpeed(6));
    act(() => result.current.togglePause());
    act(() => frameCallback({}, 1));
    expect(result.current.speed).toBe(6);
    expect(result.current.positions).toBe(initialPositions);

    act(() => result.current.togglePause());
    act(() => frameCallback({}, 1));
    expect(result.current.speed).toBe(6);
    expect(result.current.positions).not.toBe(initialPositions);
  });
});
