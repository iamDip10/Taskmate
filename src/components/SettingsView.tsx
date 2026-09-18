"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/session";
import type { LabelDTO } from "@/types";

type Props = {
  role: Role;
  labels: LabelDTO[];
  onLabelAdded: (label: LabelDTO) => void;
};

export default function SettingsView({ role, labels, onLabelAdded }: Props) {
  const router = useRouter();
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeRole() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "role" }),
    });
    router.push("/role");
    router.refresh();
  }

  async function resetSession() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "full" }),
    });
    router.push("/login");
    router.refresh();
  }

  async function addLabel(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLabel.trim(), icon: newIcon.trim() || "📌" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn&apos;t add that label.");
        return;
      }
      onLabelAdded(data.label);
      setNewLabel("");
      setNewIcon("📌");
    } catch {
      setError("Couldn&apos;t reach the server.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-card bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink-soft">Your role</h2>
        <p className="mt-1 font-display text-lg text-ink">{role === "OWNER" ? "Dip" : "EITY (His Wife)"}</p>
        <button
          onClick={changeRole}
          className="mt-3 rounded-xl border border-berry-100 px-4 py-2 text-sm font-medium text-berry-600 transition active:scale-[0.98]"
        >
          Change role
        </button>
      </section>

      {role === "OWNER" && (
        <section className="rounded-card bg-white p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-ink-soft">Manage labels</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label.id}
                className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-sm text-ink-soft"
              >
                <span>{label.icon}</span>
                {label.name}
              </span>
            ))}
          </div>

          <form onSubmit={addLabel} className="mt-4 flex gap-2">
            <input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              maxLength={4}
              className="w-14 rounded-xl border border-berry-100 bg-paper px-3 py-2.5 text-center text-lg focus:border-berry-500 focus:outline-none"
              aria-label="Label icon"
            />
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="New label name"
              maxLength={30}
              className="flex-1 rounded-xl border border-berry-100 bg-paper px-4 py-2.5 focus:border-berry-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !newLabel.trim()}
              className="rounded-xl bg-berry-500 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              Add
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-clay-600">{error}</p>}
        </section>
      )}

      <section className="rounded-card bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink-soft">Session</h2>
        <p className="mt-1 text-sm text-ink-soft">Forget this device&apos;s access code and role.</p>
        <button
          onClick={resetSession}
          className="mt-3 rounded-xl border border-clay-300 px-4 py-2 text-sm font-medium text-clay-600 transition active:scale-[0.98]"
        >
          Reset local session
        </button>
      </section>

      <section className="rounded-card bg-white p-5 text-sm text-ink-soft shadow-soft">
        <h2 className="text-sm font-semibold text-ink-soft">About TaskMate</h2>
        <p className="mt-1">
          A small, private task board shared between two people. No accounts, no workspaces —
          just what got given, and what got done.
        </p>
      </section>
    </div>
  );
}
