"use client";

import { useState } from "react";
import { useQuestionStore } from "@/lib/questions/store";
import { QuestionCard } from "./QuestionCard";

export function QuestionQueue() {
  const questions = useQuestionStore((s) => s.questions);
  const markAnswered = useQuestionStore((s) => s.markAnswered);
  const dismiss = useQuestionStore((s) => s.dismiss);
  const clearAll = useQuestionStore((s) => s.clearAll);

  const [showAnswered, setShowAnswered] = useState(false);

  const pending = questions.filter((q) => q.status === "pending");
  const answered = questions.filter((q) => q.status === "answered");
  const dismissed = questions.filter((q) => q.status === "dismissed");

  return (
    <div className="flex flex-col gap-4">
      {/* Pending */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-600">
            No questions yet. Questions from chat will appear here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onAnswer={markAnswered}
                onDismiss={dismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answered / Dismissed */}
      {(answered.length > 0 || dismissed.length > 0) && (
        <div>
          <button
            onClick={() => setShowAnswered(!showAnswered)}
            className="mb-2 text-sm text-neutral-500 hover:text-neutral-300"
          >
            {showAnswered ? "Hide" : "Show"} answered ({answered.length}) &amp;
            dismissed ({dismissed.length})
          </button>

          {showAnswered && (
            <div className="flex flex-col gap-2">
              {[...answered, ...dismissed].map((q) => (
                <div key={q.id} className="opacity-50">
                  <QuestionCard
                    question={q}
                    onAnswer={markAnswered}
                    onDismiss={dismiss}
                  />
                </div>
              ))}
              <button
                onClick={clearAll}
                className="mt-2 self-start rounded px-3 py-1 text-sm text-red-400 hover:bg-red-400/10"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
