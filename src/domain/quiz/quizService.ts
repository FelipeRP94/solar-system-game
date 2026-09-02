import type { Question } from "./types";
export const isCorrectAnswer = (
  question: Question,
  selectedIndex: number,
): boolean => {
  return selectedIndex === question.correctIndex;
};
export const validateQuestion = (question: Question): boolean => {
  return (
    question.options.length >= 2 &&
    question.correctIndex >= 0 &&
    question.correctIndex < question.options.length
  );
};
