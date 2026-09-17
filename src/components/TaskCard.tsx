"use client";

import { useState } from "react";
import type { Role } from "@/lib/session";
import type { TaskDTO } from "@/types";
import { PRIORITY_STYLES, formatGivenAt, formatTime, formatRelativeDay } from "@/lib/utils";
import ReactionBar from "./ReactionBar";

type Props = {
  task: TaskDTO;
  role: Role;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string, note: string | null) => void;
  busy?: boolean;
};

export default function TaskCard({
  task,
  role,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  onReact,
  busy,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const priorityStyle = PRIORITY_STYLES[task.priority];
  const isOwner = role === "OWNER";
  const isCompleted = task.status === "COMPLETED";

  function handleComplete() {
    setCompleting(true);
    // Small delay so the check animation has a moment to play before the
    // list re-sorts the task out from under it.
    setTimeout(() => onComplete(task.id), 260);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-card border bg-white shadow-soft transition-all animate-pop-in ${
        completing ? "scale-[0.98] opacity-60" : ""
      } ${isCompleted ? "border-sage-200" : priorityStyle.border}`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${
          isCompleted ? "bg-sage-500" : priorityStyle.dot
        }`}
        aria-hidden
      />

      <div className="px-5 py-4 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-sage-600">
                <span className="animate-check-pop">✓</span> Completed
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${priorityStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
                {priorityStyle.label}
              </span>
            )}
          </div>

          {isOwner && (
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-100">
              {!isCompleted && (
                <button
                  onClick={() => onEdit(task)}
                  className="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-berry-50 hover:text-berry-600"
                  aria-label="Edit task"
                >
                  Edit
                </button>
              )}
              {isCompleted && (
                <button
                  onClick={() => onReopen(task.id)}
                  className="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-slate-50 hover:text-slate-600"
                  aria-label="Reopen task"
                >
                  Reopen
                </button>
              )}
              {confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(task.id)}
                    className="rounded-lg bg-clay-500 px-2 py-1 text-xs font-medium text-white"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg px-2 py-1 text-xs text-ink-soft"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-clay-50 hover:text-clay-600"
                  aria-label="Delete task"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{task.title}</h3>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-soft">{task.description}</p>
        )}

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-soft">
          <span>{task.label.icon}</span>
          <span>{task.label.name}</span>
        </div>

        <p className="mt-1 text-xs text-ink-soft/80">
          {isCompleted && task.completedAt
            ? `Completed ${formatRelativeDay(task.completedAt)} · ${formatTime(task.completedAt)}`
            : `Given ${formatGivenAt(task.createdAt)}`}
        </p>

        {isCompleted ? (
          isOwner ? (
            <div className="mt-3 border-t border-paper pt-3">
              <ReactionBar
                current={task.reaction}
                onReact={(emoji, note) => onReact(task.id, emoji, note)}
              />
            </div>
          ) : task.reaction ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-berry-50 px-3 py-2">
              <span className="text-lg">{task.reaction.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-berry-700">Dip&apos;s reaction</p>
                {task.reaction.note && (
                  <p className="truncate text-xs text-ink-soft">{task.reaction.note}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs italic text-ink-soft">Waiting on Dip&apos;s reaction…</p>
          )
        ) : (
          !isOwner && (
            <button
              onClick={handleComplete}
              disabled={busy || completing}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sage-500 py-3 text-sm font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
            >
              {completing ? "Nice work!" : "Mark Completed"}
              {!completing && <span aria-hidden>→</span>}
            </button>
          )
        )}
      </div>
    </div>
  );
}
