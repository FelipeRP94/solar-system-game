import { describe, expect, it } from "vitest";
import { isCorrectAnswer, validateQuestion } from "./quizService";
import type { Question } from "./types";
const sample: Question = {
  id: "x",
  planetId: "mars",
  prompt: "?",
  options: ["a", "b"],
  correctIndex: 1,
  explanation: "Because.",
};
describe("quizService", () => {
  it("validates answers", () => {
    expect(isCorrectAnswer(sample, 1)).toBe(true);
    expect(isCorrectAnswer(sample, 0)).toBe(false);
  });
  it("rejects invalid question indexes", () => {
    expect(validateQuestion(sample)).toBe(true);
    expect(validateQuestion({ ...sample, correctIndex: 2 })).toBe(false);
  });
});
