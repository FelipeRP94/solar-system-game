"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
  useTexture,
} from "@react-three/drei";
import {
  Component,
  type MutableRefObject,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { PLANETS, type PlanetId } from "@/domain/planets/planetService";
import { usePlanetPositions } from "./hooks/usePlanetPositions";
import { Spaceship, type ShipOrientation } from "./components/Spaceship";
import { PlanetFallbackNodes, PlanetNode } from "./components/PlanetNode";
import { OrbitRing } from "./components/OrbitRing";
import { ProximityPrompt } from "./components/ProximityPrompt";
import {
  MAP_NAVIGATION_BOUNDS,
  MAP_CONTROL_HELP,
  MAP_ORBIT_CONTROLS,
  clampMapControlsChange,
  resetMapCamera,
} from "./mapNavigation";
import { useAppStore } from "@/store/useAppStore";
import { PlanetInfoPanel } from "@/ui/PlanetInfoPanel";
import { QuizModal } from "@/ui/quiz/QuizModal";
import {
  SATURN_RING_TEXTURE,
  PLANET_TEXTURES,
  SUN_TEXTURE,
} from "./planetTextures";
import type { PlanetNodeProps } from "./components/PlanetNode";

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
  ship: MutableRefObject<THREE.Vector3>;
  orientation: MutableRefObject<ShipOrientation>;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  viewMode: ViewMode;
  onSelect: (planetId: string) => void;
};

type ViewMode = "map" | "cockpit";

const HoldToLookCamera = ({
  ship,
  orientation,
}: {
  ship: MutableRefObject<THREE.Vector3>;
  orientation: MutableRefObject<ShipOrientation>;
}) => {
  const { get, gl } = useThree();
  const isLooking = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;
    const stopLooking = () => {
      isLooking.current = false;
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) isLooking.current = true;
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) stopLooking();
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (!isLooking.current) return;
      if ((event.buttons & 1) === 0) {
        stopLooking();
        return;
      }

      const sensitivity = 0.0025;
      orientation.current.yaw -= event.movementX * sensitivity;
      orientation.current.pitch = THREE.MathUtils.clamp(
        orientation.current.pitch - event.movementY * sensitivity,
        -Math.PI / 2 + 0.05,
        Math.PI / 2 - 0.05,
      );
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("blur", stopLooking);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", stopLooking);
    };
  }, [gl, orientation]);

  useFrame(() => {
    const camera = get().camera;
    camera.position.copy(ship.current);
    camera.rotation.order = "YXZ";
    camera.rotation.set(
      orientation.current.pitch,
      orientation.current.yaw,
      0,
    );
  });

  return null;
};

const SpaceMapContents = ({
  speed,
  paused,
  ship,
  orientation,
  controlsRef,
  viewMode,
  onSelect,
}: SpaceMapContentsProps) => {
  const { positions } = usePlanetPositions({ speed, paused });
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
    <>
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
      {positions.map((position) => (
        <OrbitRing
          key={`orbit-${position.planetId}`}
          radius={position.sceneDistance}
        />
      ))}
      <Suspense
        fallback={
          <>
            <SunFallback />
            <PlanetFallbackNodes
              planets={positions.map((position) => ({
                planet: PLANETS.find((item) => item.id === position.planetId)!,
                position,
              }))}
              onSelect={onSelect}
            />
          </>
        }
      >
        <PlanetTextureErrorBoundary
          fallback={
            <>
              <SunFallback />
              <PlanetFallbackNodes
                planets={positions.map((position) => ({
                  planet: PLANETS.find(
                    (item) => item.id === position.planetId,
                  )!,
                  position,
                }))}
                onSelect={onSelect}
              />
            </>
          }
        >
          <TexturedPlanetNodes positions={positions} onSelect={onSelect} />
        </PlanetTextureErrorBoundary>
      </Suspense>
      <Suspense fallback={null}>
        <Spaceship
          onMove={onMove}
          orientationRef={orientation}
          relativeToCamera={viewMode === "cockpit"}
        />
      </Suspense>
      {viewMode === "cockpit" ? (
        <>
          <HoldToLookCamera ship={ship} orientation={orientation} />
        </>
      ) : (
        <OrbitControls
          ref={controlsRef}
          {...MAP_ORBIT_CONTROLS}
          onChange={(event) =>
            clampMapControlsChange(event, MAP_NAVIGATION_BOUNDS)
          }
        />
      )}
    </>
  );
};

export const SpaceMapScene = () => {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const ship = useRef(new THREE.Vector3(0, 0, 4));
  const shipOrientation = useRef<ShipOrientation>({ yaw: 0, pitch: 0 });
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selected, setSelected] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const nearbyPlanetId = useAppStore((state) => state.nearbyPlanetId);

  useEffect(() => {
    const handleViewToggle = (event: KeyboardEvent) => {
      if (event.code === "KeyV") {
        setViewMode((current) => (current === "map" ? "cockpit" : "map"));
      }
    };

    window.addEventListener("keydown", handleViewToggle);
    return () => window.removeEventListener("keydown", handleViewToggle);
  }, []);

  const isCockpitView = viewMode === "cockpit";

  return (
    <main className="space-map">
      <div className="map-header">
        <div>
          <span className="eyebrow">ORBITAL FIELD / 01</span>
          <h1>Mapa del sistema solar</h1>
        </div>
        <div className="legend">
          <span>WASD mover</span>
          <span>Shift turbo</span>
          <span>V cambiar cámara</span>
        </div>
      </div>
      <Canvas camera={{ position: [6, 6, 12], fov: 45 }}>
        <SpaceMapContents
          speed={speed}
          paused={paused}
          ship={ship}
          orientation={shipOrientation}
          controlsRef={controlsRef}
          viewMode={viewMode}
          onSelect={setSelected}
        />
      </Canvas>
      {isCockpitView && <div className="cockpit-overlay" aria-hidden="true" />}
      <button
        className="secondary-button view-toggle"
        type="button"
        onClick={() =>
          setViewMode((current) => (current === "map" ? "cockpit" : "map"))
        }
        aria-pressed={isCockpitView}
      >
        {isCockpitView ? "Vista del sistema solar" : "Vista interior"}
      </button>
      {!isCockpitView && (
        <section className="map-controls" aria-labelledby="map-controls-title">
          <h2 id="map-controls-title">Controles del mapa</h2>
          <ul>
            {MAP_CONTROL_HELP.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
          <button
            className="secondary-button map-reset-button"
            type="button"
            onClick={() => {
              if (controlsRef.current) resetMapCamera(controlsRef.current);
            }}
          >
            Restaurar vista inicial
          </button>
        </section>
      )}
      {!isCockpitView && (
        <div className="map-hint">
          Acércate a un planeta para activar sus opciones
        </div>
      )}
      {isCockpitView && (
        <div className="cockpit-hint">
          Mantén pulsado el botón izquierdo y mueve el ratón
        </div>
      )}
      <div className="orbit-controls" aria-label="Controles orbitales">
        <label htmlFor="orbital-speed">
          Velocidad orbital: {speed.toFixed(1)}x
        </label>
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
        <button
          type="button"
          className="secondary-button"
          onClick={() => setPaused((value) => !value)}
        >
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
