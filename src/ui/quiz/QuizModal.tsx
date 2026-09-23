"use client";
import { useState } from "react";
import { QUIZ } from "@/data/static/quiz";
import { isCorrectAnswer } from "@/domain/quiz/quizService";
import { getPlanet } from "@/domain/planets/planetService";
import { useProgressStore } from "@/store/useProgressStore";
export const QuizModal = ({
  planetId,
  onClose,
}: {
  planetId: string;
  onClose: () => void;
}) => {
  const questions = QUIZ[planetId] ?? [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const markComplete = useProgressStore((state) => state.markQuizCompleted);
  const planet = getPlanet(planetId);
  const current = questions[index];
  const isCorrect =
    current !== undefined &&
    selected !== null &&
    isCorrectAnswer(current, selected);
  const answer = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
  };
  const next = () => {
    if (index === questions.length - 1) {
      markComplete(planetId);
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  };
  return (
    <div className="modal-backdrop">
      <section
        className="quiz panel"
        role="dialog"
        aria-modal="true"
        aria-label="Test planetario"
      >
        <button className="close-button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        {finished ? (
          <>
            <span className="eyebrow">MISSION COMPLETE</span>
            <h2>Test completado</h2>
            <p>Has registrado tu exploración de {planet?.name}.</p>
            <button className="primary-button" onClick={onClose}>
              Volver al mapa
            </button>
          </>
        ) : current ? (
          <>
            <span className="eyebrow">
              KNOWLEDGE CHECK / {index + 1} DE {questions.length}
            </span>
            <h2>{planet?.name}</h2>
            <p className="question">{current.prompt}</p>
            <div className="options">
              {current.options.map((option, optionIndex) => (
                <button
                  key={option}
                  className={
                    selected === optionIndex
                      ? isCorrectAnswer(current, optionIndex)
                        ? "option correct"
                        : "option wrong"
                      : "option"
                  }
                  onClick={() => answer(optionIndex)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selected !== null && (
              <div
                className={`feedback ${isCorrect ? "success" : "error"}`}
              >
                <strong>
                  {isCorrect
                    ? "Correcto"
                    : `La respuesta era: ${current.options[current.correctIndex]}`}
                </strong>
                <p>{current.explanation}</p>
                <button className="primary-button" onClick={next}>
                  {index === questions.length - 1 ? "Finalizar" : "Siguiente"}{" "}
                  <span>→</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <p>No hay preguntas disponibles.</p>
        )}
      </section>
    </div>
  );
};
