"use client";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, useTexture } from "@react-three/drei";
import { Component, type ReactNode, Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { PLANETS, type PlanetId } from "@/domain/planets/planetService";
import { usePlanetPositions } from "./hooks/usePlanetPositions";
import { Spaceship } from "./components/Spaceship";
import { PlanetFallbackNodes, PlanetNode } from "./components/PlanetNode";
import { OrbitRing } from "./components/OrbitRing";
import { SpaceMapCameraRig } from "./components/SpaceMapCameraRig";
import { ProximityPrompt } from "./components/ProximityPrompt";
import { useAppStore } from "@/store/useAppStore";
import { PlanetInfoPanel } from "@/ui/PlanetInfoPanel";
import { QuizModal } from "@/ui/quiz/QuizModal";
import {
  SATURN_RING_TEXTURE,
  PLANET_TEXTURES,
  SUN_TEXTURE,
} from "./planetTextures";
import type { PlanetNodeProps } from "./components/PlanetNode";
import { auToSceneDistance } from "@/domain/ephemeris/distanceScale";

const PLANET_TEXTURE_SET = {
  ...PLANET_TEXTURES,
  saturnRing: SATURN_RING_TEXTURE,
  sun: SUN_TEXTURE,
} as const;

type TexturedPlanetNodesProps = {
  positions: ReturnType<typeof usePlanetPositions>["positions"];
  onSelect: (planetId: string) => void;
};

const TexturedPlanetNodes = ({
  positions,
  onSelect,
}: TexturedPlanetNodesProps) => {
  const textures = useTexture(PLANET_TEXTURE_SET, (loadedTextures) => {
    Object.entries(loadedTextures).forEach(([key, texture]) => {
      if (key !== "saturnRing") {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
      }
    });
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial
          map={textures.sun}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>
      {positions.map((position) => {
        const planet = PLANETS.find((item) => item.id === position.planetId)!;
        const props: PlanetNodeProps = {
          planet,
          position,
          texture: textures[planet.id as PlanetId],
          ringTexture: textures.saturnRing,
          onSelect: () => onSelect(planet.id),
        };
        return <PlanetNode key={planet.id} {...props} />;
      })}
    </>
  );
};

const SunFallback = () => (
  <mesh>
    <sphereGeometry args={[1.7, 32, 32]} />
    <meshBasicMaterial color="#ffb342" />
  </mesh>
);

class PlanetTextureErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Failed to load centralized planet textures", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type SpaceMapContentsProps = {
  speed: number;
  paused: boolean;
  ship: React.MutableRefObject<THREE.Vector3>;
  onSelect: (planetId: string) => void;
};

const SpaceMapContents = ({ speed, paused, ship, onSelect }: SpaceMapContentsProps) => {
  const { positions } = usePlanetPositions({ speed, paused });
  const setNearby = useAppStore((state) => state.setNearbyPlanet);
  const onMove = (current: THREE.Vector3) => {
    ship.current.copy(current);
    let closest: string | null = null;
    let distance = 2.4;
    positions.forEach((position) => {
      const next = current.distanceTo(new THREE.Vector3(position.x, 0, position.z));
      if (next < distance) {
        distance = next;
        closest = position.planetId;
      }
    });
    setNearby(closest);
  };
  return (
    <>
      <color attach="background" args={["#050817"]} />
      <fog attach="fog" args={["#050817", 20, 100]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 0, 0]} intensity={8} color="#ffcf78" />
      <Stars radius={90} depth={40} count={1800} factor={2} saturation={0} fade />
      {positions.map((position) => (
        <OrbitRing key={`orbit-${position.planetId}`} radius={auToSceneDistance(PLANETS.find((planet) => planet.id === position.planetId)!.distanceFromSunAU)} />
      ))}
      <Suspense fallback={<><SunFallback /><PlanetFallbackNodes planets={positions.map((position) => ({ planet: PLANETS.find((item) => item.id === position.planetId)!, position }))} onSelect={onSelect} /></>}>
        <PlanetTextureErrorBoundary fallback={<><SunFallback /><PlanetFallbackNodes planets={positions.map((position) => ({ planet: PLANETS.find((item) => item.id === position.planetId)!, position }))} onSelect={onSelect} /></>}>
          <TexturedPlanetNodes positions={positions} onSelect={onSelect} />
        </PlanetTextureErrorBoundary>
      </Suspense>
      <Suspense fallback={<mesh position={[0, 0, 4]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.45, 1.8, 4]} /><meshStandardMaterial color="#4dd8ff" emissive="#116080" /></mesh>}>
        <Spaceship positionRef={ship} onMove={onMove} />
      </Suspense>
      <SpaceMapCameraRig target={ship} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </>
  );
};

export const SpaceMapScene = () => {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const ship = useRef(new THREE.Vector3(0, 0, 4));
  const [selected, setSelected] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const nearbyPlanetId = useAppStore((state) => state.nearbyPlanetId);
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
        <SpaceMapContents
          speed={speed}
          paused={paused}
          ship={ship}
          onSelect={setSelected}
        />
      </Canvas>
      <div className="map-hint">
        Acércate a un planeta para activar sus opciones
      </div>
      <div className="orbit-controls" aria-label="Controles orbitales">
        <label htmlFor="orbital-speed">Velocidad orbital: {speed.toFixed(1)}x</label>
        <input
          id="orbital-speed"
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={speed}
          aria-label="Velocidad orbital"
          onChange={(event) => setSpeed(Number(event.target.value))}
        />
        <button type="button" className="secondary-button" onClick={() => setPaused((value) => !value)}>
          {paused ? "Reanudar" : "Pausar"}
        </button>
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
