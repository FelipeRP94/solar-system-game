"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
  useTexture,
} from "@react-three/drei";
import {
  Component,
  memo,
  type MutableRefObject,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { PLANETS_BY_ID, type PlanetId } from "@/domain/planets/planetService";
import { usePlanetPositions } from "./hooks/usePlanetPositions";
import { Spaceship, type ShipOrientation } from "./components/Spaceship";
import { PlanetFallbackNodes, PlanetNode } from "./components/PlanetNode";
import { getPlanetVisualRadius } from "./components/planetVisualScale";
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

const SUN_VISUAL_RADIUS = 2.2;

const PLANET_TEXTURE_SET = {
  ...PLANET_TEXTURES,
  saturnRing: SATURN_RING_TEXTURE,
  sun: SUN_TEXTURE,
} as const;

type TexturedPlanetNodesProps = {
  positions: ReturnType<typeof usePlanetPositions>["positions"];
  speedRef: MutableRefObject<number>;
  positionsRef: ReturnType<typeof usePlanetPositions>["positionsRef"];
  isAnimatingRef: ReturnType<typeof usePlanetPositions>["isAnimatingRef"];
  onSelect: (planetId: string) => void;
};

const TexturedPlanetNodes = ({
  positions,
  speedRef,
  positionsRef,
  isAnimatingRef,
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
        <sphereGeometry args={[SUN_VISUAL_RADIUS, 32, 32]} />
        <meshBasicMaterial
          map={textures.sun}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>
      {positions.map((position, positionIndex) => {
        const planet = PLANETS_BY_ID.get(position.planetId as PlanetId)!;
        const props: PlanetNodeProps = {
          planet,
          position,
          speedRef,
          positionsRef,
          isAnimatingRef,
          positionIndex,
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
    <sphereGeometry args={[SUN_VISUAL_RADIUS, 32, 32]} />
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
  speedRef: MutableRefObject<number>;
  pausedRef: MutableRefObject<boolean>;
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

const SpaceMapContents = memo(({
  speedRef,
  pausedRef,
  ship,
  orientation,
  controlsRef,
  viewMode,
  onSelect,
}: SpaceMapContentsProps) => {
  const { positions, orbits, positionsRef, isAnimatingRef } = usePlanetPositions({
    speedRef,
    pausedRef,
  });
  const setNearby = useAppStore((state) => state.setNearbyPlanet);
  const nearbyPlanetRef = useRef<string | null>(null);
  const onMove = (current: THREE.Vector3) => {
    ship.current.copy(current);
    let closest: string | null = null;
    let distanceSquared = 2.4 ** 2;
    positionsRef.current.forEach((position) => {
      const deltaX = current.x - position.x;
      const deltaY = current.y - position.y;
      const deltaZ = current.z - position.z;
      const nextDistanceSquared =
        deltaX ** 2 + deltaY ** 2 + deltaZ ** 2;
      if (nextDistanceSquared < distanceSquared) {
        distanceSquared = nextDistanceSquared;
        closest = position.planetId;
      }
    });
    if (nearbyPlanetRef.current !== closest) {
      nearbyPlanetRef.current = closest;
      setNearby(closest);
    }
  };

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 24, 130]} />
      <ambientLight intensity={1} />
      <pointLight
        position={[0, 0, 0]}
        intensity={16}
        decay={1}
        color="#ffcf78"
      />
      <Stars
        radius={90}
        depth={40}
        count={1800}
        factor={2}
        saturation={0}
        fade
      />
      {orbits.map((orbit) => (
        <OrbitRing
          key={`orbit-${orbit.planetId}`}
          points={orbit.points}
        />
      ))}
      <Suspense
        fallback={
          <>
            <SunFallback />
            <PlanetFallbackNodes
              planets={positions.map((position) => ({
                planet: PLANETS_BY_ID.get(position.planetId as PlanetId)!,
                position,
              }))}
              speedRef={speedRef}
              positionsRef={positionsRef}
              isAnimatingRef={isAnimatingRef}
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
                  planet: PLANETS_BY_ID.get(position.planetId as PlanetId)!,
                  position,
                }))}
                speedRef={speedRef}
                positionsRef={positionsRef}
                isAnimatingRef={isAnimatingRef}
                onSelect={onSelect}
              />
            </>
          }
        >
          <TexturedPlanetNodes
            positions={positions}
            speedRef={speedRef}
            positionsRef={positionsRef}
            isAnimatingRef={isAnimatingRef}
            onSelect={onSelect}
          />
        </PlanetTextureErrorBoundary>
      </Suspense>
      <Spaceship
        onMove={onMove}
        orientationRef={orientation}
        relativeToCamera={viewMode === "cockpit"}
      />
      {viewMode === "cockpit" ? (
        <>
          <HoldToLookCamera ship={ship} orientation={orientation} />
        </>
      ) : (
        <OrbitControls
          ref={controlsRef}
          {...MAP_ORBIT_CONTROLS}
          onChange={(event) => {
            const collisionSpheres = [
              { x: 0, y: 0, z: 0, radius: SUN_VISUAL_RADIUS },
              ...positionsRef.current.flatMap((position) => {
                const planet = PLANETS_BY_ID.get(
                  position.planetId as PlanetId,
                );
                return planet
                  ? [
                      {
                        x: position.x,
                        y: position.y,
                        z: position.z,
                        radius: getPlanetVisualRadius(planet),
                      },
                    ]
                  : [];
              }),
            ];
            clampMapControlsChange(
              event,
              MAP_NAVIGATION_BOUNDS,
              collisionSpheres,
            );
          }}
        />
      )}
    </>
  );
});

SpaceMapContents.displayName = "SpaceMapContents";

export const SpaceMapScene = () => {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
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
  const updateSpeed = (nextSpeed: number) => {
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);
  };
  const togglePaused = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

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
      <Canvas
        camera={{ position: [6, 6, 12], fov: 45, near: 0.01 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <SpaceMapContents
          speedRef={speedRef}
          pausedRef={pausedRef}
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
           onChange={(event) => updateSpeed(Number(event.target.value))}
        />
        <button
          type="button"
          className="secondary-button"
           onClick={togglePaused}
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
