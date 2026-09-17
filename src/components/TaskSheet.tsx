"use client";

import { useEffect, useState } from "react";
import type { LabelDTO, Priority, TaskDTO } from "@/types";
import { PRIORITY_STYLES } from "@/lib/utils";

type Props = {
  labels: LabelDTO[];
  editingTask: TaskDTO | null;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; labelId: string; priority: Priority }) => Promise<void>;
  onSave: (id: string, data: { title: string; description: string; labelId: string; priority: Priority }) => Promise<void>;
};

const PRIORITIES: Priority[] = ["LOW", "NORMAL", "HIGH"];

export default function TaskSheet({ labels, editingTask, onClose, onCreate, onSave }: Props) {
  const isEditing = Boolean(editingTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labelId, setLabelId] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? "");
      setLabelId(editingTask.label.id);
      setPriority(editingTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setLabelId(labels[0]?.id ?? "");
      setPriority("NORMAL");
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTask, labels]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !labelId) {
      setError("Give it a title and a label.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEditing && editingTask) {
        await onSave(editingTask.id, { title, description, labelId, priority });
      } else {
        await onCreate({ title, description, labelId, priority });
      }
      onClose();
    } catch {
      setError("Couldn't save that. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full animate-slide-up rounded-t-sheet bg-white p-6 pb-8 shadow-lift sm:max-w-md sm:rounded-sheet sm:animate-pop-in">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-berry-100 sm:hidden" />

        <h2 className="font-display text-xl text-ink">
          {isEditing ? "Edit task" : "Give a task"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Task title
            </label>
            <input
              id="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Buy groceries"
              maxLength={140}
              className="w-full rounded-xl border border-berry-100 bg-paper px-4 py-3 text-ink focus:border-berry-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Description <span className="font-normal text-ink-soft/70">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any details that'll help"
              rows={2}
              className="w-full resize-none rounded-xl border border-berry-100 bg-paper px-4 py-3 text-ink focus:border-berry-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Label</label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  type="button"
                  key={label.id}
                  onClick={() => setLabelId(label.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition ${
                    labelId === label.id
                      ? "border-berry-500 bg-berry-50 text-berry-700"
                      : "border-berry-100 bg-white text-ink-soft"
                  }`}
                >
                  <span>{label.icon}</span>
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const style = PRIORITY_STYLES[p];
                const active = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition ${
                      active ? `${style.bg} ${style.border} ${style.text}` : "border-berry-100 bg-white text-ink-soft"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-clay-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-berry-100 py-3 text-sm font-semibold text-ink-soft transition active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-berry-500 py-3 text-sm font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditing ? "Save changes" : "Give task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
