"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
type ProgressState = {
  infoViewed: Set<string>;
  quizCompleted: Set<string>;
  markInfoViewed: (id: string) => void;
  markQuizCompleted: (id: string) => void;
};

type PersistedProgress = {
  infoViewed?: string[];
  quizCompleted?: string[];
};

const migrateProgress = (persisted: unknown): PersistedProgress => {
  const value = persisted as PersistedProgress | null;
  return {
    infoViewed: Array.isArray(value?.infoViewed)
      ? value.infoViewed.filter((id): id is string => typeof id === "string")
      : [],
    quizCompleted: Array.isArray(value?.quizCompleted)
      ? value.quizCompleted.filter(
          (id): id is string => typeof id === "string",
        )
      : [],
  };
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      infoViewed: new Set(),
      quizCompleted: new Set(),
      markInfoViewed: (id) =>
        set((state) =>
          state.infoViewed.has(id)
            ? state
            : { infoViewed: new Set(state.infoViewed).add(id) },
        ),
      markQuizCompleted: (id) =>
        set((state) =>
          state.quizCompleted.has(id)
            ? state
            : { quizCompleted: new Set(state.quizCompleted).add(id) },
        ),
    }),
    {
      name: "solar-system-progress",
      version: 1,
      migrate: migrateProgress,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        infoViewed: [...state.infoViewed],
        quizCompleted: [...state.quizCompleted],
      }),
      merge: (persisted, current) => {
        const progress = migrateProgress(persisted);
        return {
          ...current,
          ...progress,
          infoViewed: new Set(progress.infoViewed),
          quizCompleted: new Set(progress.quizCompleted),
        };
      },
    },
  ),
);
