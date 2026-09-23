"use client";
import { useEffect } from "react";
import { getPlanet } from "@/domain/planets/planetService";
import { useProgressStore } from "@/store/useProgressStore";
export const PlanetInfoPanel = ({
  planetId,
  onClose,
  onQuiz,
}: {
  planetId: string;
  onClose: () => void;
  onQuiz: () => void;
}) => {
  const planet = getPlanet(planetId);
  const markViewed = useProgressStore((state) => state.markInfoViewed);
  useEffect(() => {
    if (getPlanet(planetId)) markViewed(planetId);
  }, [planetId, markViewed]);
  if (!planet) return null;
  return (
    <section className="panel" aria-label={`Información de ${planet.name}`}>
      <button className="close-button" onClick={onClose} aria-label="Cerrar">
        ×
      </button>
      <span className="eyebrow">
        PLANETARY ARCHIVE / {planet.id.toUpperCase()}
      </span>
      <h2>{planet.name}</h2>
      <p className="panel-description">{planet.description}</p>
      <div className="data-grid">
        <Data
          label="Diámetro"
          value={`${(planet.radiusKm * 2).toLocaleString("es-ES")} km`}
        />
        <Data
          label="Distancia al Sol"
          value={`${planet.distanceFromSunAU} AU`}
        />
        <Data label="Temperatura media" value={`${planet.temperatureC} °C`} />
        <Data label="Gravedad" value={`${planet.gravityMs2} m/s²`} />
        <Data label="Lunas" value={String(planet.moons)} />
        <Data
          label="Periodo orbital"
          value={`${planet.orbitalPeriodDays.toLocaleString("es-ES")} días`}
        />
      </div>
      <div className="atmosphere">
        <strong>Atmósfera</strong>
        {planet.atmosphere.map((item) => (
          <div className="gas" key={item.gas}>
            <span>{item.gas}</span>
            <span>{item.percentage}%</span>
            <div className="bar">
              <i style={{ width: `${Math.min(item.percentage, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button className="primary-button" onClick={onQuiz}>
        Hacer test <span>→</span>
      </button>
    </section>
  );
};
const Data = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="data-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};
