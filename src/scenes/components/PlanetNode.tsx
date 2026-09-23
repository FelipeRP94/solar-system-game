"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type { Planet } from "@/domain/planets/types";
import type { PlanetPosition } from "@/domain/ephemeris/types";
import * as THREE from "three";
import { isWithinDragThreshold } from "../mapNavigation";

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
      group.current.position.set(position.x, 0, position.z);
    }
  });
};

export type PlanetNodeProps = {
  planet: Planet;
  position: PlanetPosition;
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
  | "positionsRef"
  | "isAnimatingRef"
  | "positionIndex"
  | "onSelect"
>;

const PlanetFallbackNode = ({
  planet,
  position,
  positionsRef,
  isAnimatingRef,
  positionIndex,
  onSelect,
}: PlanetFallbackNodeProps) => {
  const group = useRef<THREE.Group>(null);
  usePlanetPosition(group, positionsRef, isAnimatingRef, positionIndex);
  const radius =
    planet.id === "jupiter"
      ? 1.15
      : planet.id === "saturn"
        ? 0.95
        : planet.id === "earth" || planet.id === "venus"
          ? 0.48
          : 0.35;
  return (
    <group
      ref={group}
      position={[position.x, 0, position.z]}
      onClick={(event) => {
        event.stopPropagation();
        if (isWithinDragThreshold(event.delta)) onSelect();
      }}
    >
      <mesh>
        <sphereGeometry args={[radius, 24, 16]} />
        <meshStandardMaterial color={planet.color} roughness={0.8} />
      </mesh>
      {planet.id === "saturn" && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.35, 0.08, 8, 48]} />
          <meshStandardMaterial
            color="#d7b982"
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

export const PlanetNode = ({
  planet,
  position,
  positionsRef,
  isAnimatingRef,
  positionIndex,
  texture,
  ringTexture,
  onSelect,
}: PlanetNodeProps) => {
  const group = useRef<THREE.Group>(null);
  usePlanetPosition(group, positionsRef, isAnimatingRef, positionIndex);
  const radius =
    planet.id === "jupiter"
      ? 1.15
      : planet.id === "saturn"
        ? 0.95
        : planet.id === "earth" || planet.id === "venus"
          ? 0.48
          : 0.35;

  return (
    <group
      ref={group}
      position={[position.x, 0, position.z]}
      onClick={(event) => {
        event.stopPropagation();
        if (isWithinDragThreshold(event.delta)) onSelect();
      }}
    >
      <mesh>
        <sphereGeometry args={[radius, 24, 16]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>
      {planet.id === "saturn" && ringTexture && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.35, 0.08, 8, 48]} />
          <meshStandardMaterial
            alphaMap={ringTexture}
            color="#d7b982"
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

type PlanetFallbackNodesProps = {
  planets: Array<{ planet: Planet; position: PlanetPosition }>;
  onSelect: (planetId: string) => void;
};

export const PlanetFallbackNodes = ({
  planets,
  positionsRef,
  isAnimatingRef,
  onSelect,
}: PlanetFallbackNodesProps & {
  positionsRef: MutableRefObject<PlanetPosition[]>;
  isAnimatingRef: MutableRefObject<boolean>;
}) => (
  <>
    {planets.map(({ planet, position }, positionIndex) => (
      <PlanetFallbackNode
        key={planet.id}
        planet={planet}
        position={position}
        positionsRef={positionsRef}
        isAnimatingRef={isAnimatingRef}
        positionIndex={positionIndex}
        onSelect={() => onSelect(planet.id)}
      />
    ))}
  </>
);
