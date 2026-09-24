"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject, type ReactNode } from "react";
import type { Planet } from "@/domain/planets/types";
import type { PlanetPosition } from "@/domain/ephemeris/types";
import * as THREE from "three";
import { isWithinDragThreshold } from "../mapNavigation";
import { BASE_SIMULATED_DAYS_PER_SECOND } from "../hooks/usePlanetPositions";
import { getPlanetVisualRadius } from "./planetVisualScale";
import { getPlanetSpinRadiansPerSecond } from "./planetRotation";
import { SaturnRings } from "./SaturnRings";

const usePlanetPosition = (
  group: MutableRefObject<THREE.Group | null>,
  positionsRef: MutableRefObject<PlanetPosition[]>,
  isAnimatingRef: MutableRefObject<boolean>,
  positionIndex: number,
) => {
  useFrame(() => {
    if (!isAnimatingRef.current) return;
    const position = positionsRef.current[positionIndex];
    if (position && group.current) {
      group.current.position.set(position.x, position.y, position.z);
    }
  });
};

export type PlanetNodeProps = {
  planet: Planet;
  position: PlanetPosition;
  speedRef: MutableRefObject<number>;
  positionsRef: MutableRefObject<PlanetPosition[]>;
  isAnimatingRef: MutableRefObject<boolean>;
  positionIndex: number;
  texture: THREE.Texture;
  ringTexture?: THREE.Texture;
  onSelect: () => void;
};

type PlanetFallbackNodeProps = Pick<
  PlanetNodeProps,
  | "planet"
  | "position"
  | "speedRef"
  | "positionsRef"
  | "isAnimatingRef"
  | "positionIndex"
  | "onSelect"
>;

const PlanetBody = ({
  planet,
  radius,
  speedRef,
  isAnimatingRef,
  ringTexture,
  children,
}: {
  planet: Planet;
  radius: number;
  speedRef: MutableRefObject<number>;
  isAnimatingRef: MutableRefObject<boolean>;
  ringTexture?: THREE.Texture;
  children: ReactNode;
}) => {
  const sphere = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!isAnimatingRef.current || !sphere.current) return;

    // Axial tilt beyond 90 degrees represents retrograde rotation.
    sphere.current.rotation.y +=
      delta *
      getPlanetSpinRadiansPerSecond(
        planet.rotationPeriodHours,
        speedRef.current * BASE_SIMULATED_DAYS_PER_SECOND,
      );
  });

  const axisRadius = Math.max(radius * 0.02, 0.008);

  return (
    <group rotation={[THREE.MathUtils.degToRad(planet.axialTiltDegrees), 0, 0]}>
      <mesh ref={sphere}>
        <sphereGeometry args={[radius, 24, 16]} />
        {children}
      </mesh>
      <mesh renderOrder={1}>
        <cylinderGeometry args={[axisRadius, axisRadius, radius * 3, 8]} />
        <meshBasicMaterial
          color="#f3e8b4"
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {planet.id === "saturn" && (
        <SaturnRings radius={radius} texture={ringTexture} />
      )}
    </group>
  );
};

const PlanetFallbackNode = ({
  planet,
  position,
  speedRef,
  positionsRef,
  isAnimatingRef,
  positionIndex,
  onSelect,
}: PlanetFallbackNodeProps) => {
  const group = useRef<THREE.Group>(null);
  usePlanetPosition(group, positionsRef, isAnimatingRef, positionIndex);
  const radius = getPlanetVisualRadius(planet);
  return (
    <group
      ref={group}
      position={[position.x, position.y, position.z]}
      onClick={(event) => {
        event.stopPropagation();
        if (isWithinDragThreshold(event.delta)) onSelect();
      }}
    >
      <PlanetBody
        planet={planet}
        radius={radius}
        speedRef={speedRef}
        isAnimatingRef={isAnimatingRef}
      >
        <meshStandardMaterial color={planet.color} roughness={0.8} />
      </PlanetBody>
    </group>
  );
};

export const PlanetNode = ({
  planet,
  position,
  speedRef,
  positionsRef,
  isAnimatingRef,
  positionIndex,
  texture,
  ringTexture,
  onSelect,
}: PlanetNodeProps) => {
  const group = useRef<THREE.Group>(null);
  usePlanetPosition(group, positionsRef, isAnimatingRef, positionIndex);
  const radius = getPlanetVisualRadius(planet);

  return (
    <group
      ref={group}
      position={[position.x, position.y, position.z]}
      onClick={(event) => {
        event.stopPropagation();
        if (isWithinDragThreshold(event.delta)) onSelect();
      }}
    >
      <PlanetBody
        planet={planet}
        radius={radius}
        speedRef={speedRef}
        isAnimatingRef={isAnimatingRef}
        ringTexture={ringTexture}
      >
        <meshStandardMaterial map={texture} roughness={0.8} />
      </PlanetBody>
    </group>
  );
};

type PlanetFallbackNodesProps = {
  planets: Array<{ planet: Planet; position: PlanetPosition }>;
  onSelect: (planetId: string) => void;
};

export const PlanetFallbackNodes = ({
  planets,
  speedRef,
  positionsRef,
  isAnimatingRef,
  onSelect,
}: PlanetFallbackNodesProps & {
  speedRef: MutableRefObject<number>;
  positionsRef: MutableRefObject<PlanetPosition[]>;
  isAnimatingRef: MutableRefObject<boolean>;
}) => (
  <>
    {planets.map(({ planet, position }, positionIndex) => (
      <PlanetFallbackNode
        key={planet.id}
        planet={planet}
        position={position}
        speedRef={speedRef}
        positionsRef={positionsRef}
        isAnimatingRef={isAnimatingRef}
        positionIndex={positionIndex}
        onSelect={() => onSelect(planet.id)}
      />
    ))}
  </>
);
