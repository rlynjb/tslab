"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question } from "./types";

const MAX_QUESTIONS = 200;

interface QuestionStore {
  questions: Question[];
  addQuestion: (q: Omit<Question, "id" | "status">) => void;
  markAnswered: (id: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useQuestionStore = create<QuestionStore>()(
  persist(
    (set) => ({
      questions: [],

      addQuestion: (q) =>
        set((state) => {
          const newQuestion: Question = {
            ...q,
            id: crypto.randomUUID(),
            status: "pending",
          };
          let questions = [newQuestion, ...state.questions];

          // Cap at MAX_QUESTIONS — drop oldest answered/dismissed first
          if (questions.length > MAX_QUESTIONS) {
            const pending = questions.filter((q) => q.status === "pending");
            const rest = questions.filter((q) => q.status !== "pending");
            questions = [...pending, ...rest].slice(0, MAX_QUESTIONS);
          }

          return { questions };
        }),

      markAnswered: (id) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, status: "answered" as const } : q
          ),
        })),

      dismiss: (id) =>
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, status: "dismissed" as const } : q
          ),
        })),

      clearAll: () => set({ questions: [] }),
    }),
    {
      name: "question-store",
      // Serialize dates properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed?.state?.questions) {
            parsed.state.questions = parsed.state.questions.map(
              (q: Question) => ({
                ...q,
                timestamp: new Date(q.timestamp),
              })
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
