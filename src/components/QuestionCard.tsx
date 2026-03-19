"use client";

import { Question } from "@/lib/questions/types";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function QuestionCard({ question, onAnswer, onDismiss }: QuestionCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <span className="font-medium text-purple-400">
            @{question.displayName}
          </span>
          <span className="text-neutral-500">{timeAgo(question.timestamp)}</span>
        </div>
        <p className="text-neutral-200">{question.message}</p>
      </div>
      {question.status === "pending" && (
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onAnswer(question.id)}
            className="rounded px-2 py-1 text-sm text-green-400 hover:bg-green-400/10"
            title="Mark answered"
          >
            &#10003;
          </button>
          <button
            onClick={() => onDismiss(question.id)}
            className="rounded px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-700"
            title="Dismiss"
          >
            &#10005;
          </button>
        </div>
      )}
    </div>
  );
}
