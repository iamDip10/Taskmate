"use client";

import { useState } from "react";
import { REACTION_EMOJIS } from "@/types";
import type { ReactionDTO } from "@/types";

type Props = {
  current: ReactionDTO | null;
  onReact: (emoji: string, note: string | null) => void;
};

const NOTE_PRESETS = ["Great job!", "Perfect.", "Please do this earlier next time.", "Needs improvement."];

export default function ReactionBar({ current, onReact }: Props) {
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState(current?.note ?? "");
  const [justSet, setJustSet] = useState<string | null>(null);

  function pick(emoji: string) {
    if (showNoteFor === emoji) {
      setShowNoteFor(null);
      return;
    }
    setShowNoteFor(emoji);
    setNote(current?.emoji === emoji ? current?.note ?? "" : "");
  }

  function confirm(emoji: string) {
    onReact(emoji, note.trim() || null);
    setJustSet(emoji);
    setShowNoteFor(null);
    setTimeout(() => setJustSet(null), 900);
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-soft">
        {current ? "Your reaction" : "How did she do?"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {REACTION_EMOJIS.map((emoji) => {
          const active = current?.emoji === emoji;
          return (
            <button
              key={emoji}
              onClick={() => pick(emoji)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition active:scale-90 ${
                active ? "bg-berry-500 shadow-soft" : "bg-paper hover:bg-berry-50"
              } ${justSet === emoji ? "animate-pop-in" : ""}`}
              aria-pressed={active}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {showNoteFor && (
        <div className="mt-3 animate-slide-up space-y-2 rounded-xl bg-paper p-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note (optional)"
            maxLength={200}
            className="w-full rounded-lg border border-berry-100 bg-white px-3 py-2 text-sm focus:border-berry-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {NOTE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setNote(preset)}
                className="rounded-full border border-berry-100 bg-white px-2.5 py-1 text-xs text-ink-soft transition hover:border-berry-300"
              >
                {preset}
              </button>
            ))}
          </div>
          <button
            onClick={() => confirm(showNoteFor)}
            className="w-full rounded-lg bg-berry-500 py-2 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Save reaction
          </button>
        </div>
      )}
    </div>
  );
}
