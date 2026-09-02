import type { Planet } from "@/domain/planets/types";
import type { PlanetPosition } from "@/domain/ephemeris/types";
export const PlanetNode = ({
  planet,
  position,
  onSelect,
}: {
  planet: Planet;
  position: PlanetPosition;
  onSelect: () => void;
}) => {
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
      position={[position.x, 0, position.z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <mesh>
        <sphereGeometry args={[radius, 24, 16]} />
        <meshStandardMaterial color={planet.color} roughness={0.8} />
      </mesh>
      {planet.id === "saturn" && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.35, 0.08, 8, 48]} />
          <meshStandardMaterial color="#d7b982" />
        </mesh>
      )}
    </group>
  );
};
