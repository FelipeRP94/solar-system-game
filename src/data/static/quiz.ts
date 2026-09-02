import type { Question } from "@/domain/quiz/types";

const question = (
  planetId: string,
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Question => ({ planetId, id, prompt, options, correctIndex, explanation });
export const QUIZ: Record<string, Question[]> = {
  mercury: [
    question(
      "mercury",
      "m1",
      "¿Cuál es el planeta más pequeño?",
      ["Marte", "Mercurio", "Venus"],
      1,
      "Mercurio es el planeta más pequeño del sistema solar.",
    ),
  ],
  venus: [
    question(
      "venus",
      "v1",
      "¿Qué planeta es el más caliente?",
      ["Venus", "Mercurio", "Marte"],
      0,
      "La densa atmósfera de Venus provoca un efecto invernadero extremo.",
    ),
  ],
  earth: [
    question(
      "earth",
      "e1",
      "¿Cuál es el gas más abundante de la atmósfera terrestre?",
      ["Oxígeno", "Nitrógeno", "Argón"],
      1,
      "El nitrógeno representa aproximadamente el 78% de nuestra atmósfera.",
    ),
  ],
  mars: [
    question(
      "mars",
      "ma1",
      "¿Por qué se conoce a Marte como el planeta rojo?",
      [
        "Por sus océanos",
        "Por el hierro oxidado de su superficie",
        "Por sus anillos",
      ],
      1,
      "Los minerales de hierro oxidados del suelo le dan su color rojizo.",
    ),
  ],
  jupiter: [
    question(
      "jupiter",
      "j1",
      "¿Cuál es el planeta más grande?",
      ["Saturno", "Júpiter", "Neptuno"],
      1,
      "Júpiter es el mayor planeta del sistema solar.",
    ),
  ],
  saturn: [
    question(
      "saturn",
      "s1",
      "¿Qué característica destaca en Saturno?",
      ["Sus anillos", "Sus océanos", "Su superficie sólida"],
      0,
      "Saturno posee el sistema de anillos más visible y complejo.",
    ),
  ],
  uranus: [
    question(
      "uranus",
      "u1",
      "¿Cómo gira Urano?",
      ["Casi tumbado", "Al revés cada hora", "No gira"],
      0,
      "Su eje está inclinado unos 98 grados, por eso parece girar tumbado.",
    ),
  ],
  neptune: [
    question(
      "neptune",
      "n1",
      "¿Qué planeta tiene los vientos más veloces?",
      ["Tierra", "Júpiter", "Neptuno"],
      2,
      "En Neptuno se han medido vientos de más de 2.000 km/h.",
    ),
  ],
};
