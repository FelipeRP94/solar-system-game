import { getPlanet } from "@/domain/planets/planetService";
export const ProximityPrompt = ({
  planetId,
  onInfo,
  onQuiz,
}: {
  planetId: string;
  onInfo: () => void;
  onQuiz: () => void;
}) => {
  const planet = getPlanet(planetId);
  if (!planet) return null;
  return (
    <div className="proximity-prompt">
      <span className="eyebrow">
        SIGNAL LOCKED / {planet.name.toUpperCase()}
      </span>
      <strong>Has llegado a rango de exploración</strong>
      <div>
        <button className="primary-button" onClick={onInfo}>
          Ver información
        </button>
        <button className="secondary-button" onClick={onQuiz}>
          Hacer test
        </button>
      </div>
    </div>
  );
};
