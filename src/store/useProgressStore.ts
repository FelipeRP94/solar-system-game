"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type ProgressState = {
  infoViewed: Set<string>;
  quizCompleted: Set<string>;
  markInfoViewed: (id: string) => void;
  markQuizCompleted: (id: string) => void;
};
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      infoViewed: new Set(),
      quizCompleted: new Set(),
      markInfoViewed: (id) =>
        set((state) => ({ infoViewed: new Set(state.infoViewed).add(id) })),
      markQuizCompleted: (id) =>
        set((state) => ({
          quizCompleted: new Set(state.quizCompleted).add(id),
        })),
    }),
    {
      name: "solar-system-progress",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        infoViewed: [...state.infoViewed],
        quizCompleted: [...state.quizCompleted],
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as { infoViewed?: string[]; quizCompleted?: string[] }),
        infoViewed: new Set(
          (persisted as { infoViewed?: string[] })?.infoViewed ?? [],
        ),
        quizCompleted: new Set(
          (persisted as { quizCompleted?: string[] })?.quizCompleted ?? [],
        ),
      }),
    },
  ),
);
