"use client";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { PLANETS } from "@/domain/planets/planetService";
import { usePlanetPositions } from "./hooks/usePlanetPositions";
import { Spaceship } from "./components/Spaceship";
import { PlanetNode } from "./components/PlanetNode";
import { OrbitRing } from "./components/OrbitRing";
import { SpaceMapCameraRig } from "./components/SpaceMapCameraRig";
import { ProximityPrompt } from "./components/ProximityPrompt";
import { useAppStore } from "@/store/useAppStore";
import { PlanetInfoPanel } from "@/ui/PlanetInfoPanel";
import { QuizModal } from "@/ui/quiz/QuizModal";

export const SpaceMapScene = () => {
  const positions = usePlanetPositions();
  const ship = useRef(new THREE.Vector3(0, 0, 4));
  const [selected, setSelected] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const nearbyPlanetId = useAppStore((state) => state.nearbyPlanetId);
  const setNearby = useAppStore((state) => state.setNearbyPlanet);
  const onMove = (current: THREE.Vector3) => {
    ship.current.copy(current);
    let closest: string | null = null;
    let distance = 2.4;
    positions.forEach((position) => {
      const next = current.distanceTo(
        new THREE.Vector3(position.x, 0, position.z),
      );
      if (next < distance) {
        distance = next;
        closest = position.planetId;
      }
    });
    setNearby(closest);
  };
  return (
    <main className="space-map">
      <div className="map-header">
        <div>
          <span className="eyebrow">ORBITAL FIELD / 01</span>
          <h1>Mapa del sistema solar</h1>
        </div>
        <div className="legend">
          <span>
            <i className="dot cyan" /> Nave
          </span>
          <span>WASD mover</span>
          <span>Shift turbo</span>
        </div>
      </div>
      <Canvas camera={{ position: [6, 6, 12], fov: 45 }}>
        <color attach="background" args={["#050817"]} />
        <fog attach="fog" args={["#050817", 20, 100]} />
        <ambientLight intensity={1.2} />
        <pointLight position={[0, 0, 0]} intensity={8} color="#ffcf78" />
        <Stars
          radius={90}
          depth={40}
          count={1800}
          factor={2}
          saturation={0}
          fade
        />
        <mesh>
          <sphereGeometry args={[1.7, 32, 32]} />
          <meshBasicMaterial color="#ffb342" />
        </mesh>
        {positions.map((position) => (
          <OrbitRing
            key={`orbit-${position.planetId}`}
            radius={position.sceneDistance}
          />
        ))}
        {positions.map((position) => {
          const planet = PLANETS.find((item) => item.id === position.planetId)!;
          return (
            <PlanetNode
              key={planet.id}
              planet={planet}
              position={position}
              onSelect={() => setSelected(planet.id)}
            />
          );
        })}
        <Spaceship positionRef={ship} onMove={onMove} />
        <SpaceMapCameraRig target={ship} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <div className="map-hint">
        Acércate a un planeta para activar sus opciones
      </div>
      {nearbyPlanetId && !selected && !quiz && (
        <ProximityPrompt
          planetId={nearbyPlanetId}
          onInfo={() => setSelected(nearbyPlanetId)}
          onQuiz={() => setQuiz(nearbyPlanetId)}
        />
      )}
      {selected && !quiz && (
        <PlanetInfoPanel
          planetId={selected}
          onClose={() => setSelected(null)}
          onQuiz={() => {
            setQuiz(selected);
            setSelected(null);
          }}
        />
      )}
      {quiz && <QuizModal planetId={quiz} onClose={() => setQuiz(null)} />}
    </main>
  );
};
