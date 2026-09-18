"use client";

import { useMemo, useState } from "react";
import type { Role } from "@/lib/session";
import type { LabelDTO, Priority, TaskDTO } from "@/types";
import { greeting } from "@/lib/utils";
import BottomNav, { type Tab } from "./BottomNav";
import StatsSummary from "./StatsSummary";
import SectionHeader from "./SectionHeader";
import TaskCard from "./TaskCard";
import TaskSheet from "./TaskSheet";
import SettingsView from "./SettingsView";

type Props = {
  role: Role;
  initialTasks: TaskDTO[];
  labels: LabelDTO[];
};

export default function Dashboard({ role, initialTasks, labels: initialLabels }: Props) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [labels, setLabels] = useState<LabelDTO[]>(initialLabels);
  const [tab, setTab] = useState<Tab>("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const given = useMemo(() => tasks.filter((t) => t.status === "GIVEN"), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.status === "COMPLETED"), [tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return completed.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === today)
      .length;
  }, [completed]);
  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  function openCreate() {
    setEditingTask(null);
    setSheetOpen(true);
  }
  function openEdit(task: TaskDTO) {
    setEditingTask(task);
    setSheetOpen(true);
  }
  function closeSheet() {
    setSheetOpen(false);
    setEditingTask(null);
  }

  async function createTask(data: { title: string; description: string; labelId: string; priority: Priority }) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const { task } = await res.json();
    setTasks((prev) => [task, ...prev]);
  }

  async function saveTask(id: string, data: { title: string; description: string; labelId: string; priority: Priority }) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", ...data }),
    });
    if (!res.ok) throw new Error("Failed to save task");
    const { task } = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
  }

  async function completeTask(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function reopenTask(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function reactToTask(id: string, emoji: string, note: string | null) {
    const res = await fetch(`/api/tasks/${id}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji, note }),
    });
    if (res.ok) {
      const { reaction } = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, reaction: { emoji: reaction.emoji, note: reaction.note } } : t))
      );
    }
  }

  const cardProps = {
    role,
    onComplete: completeTask,
    onReopen: reopenTask,
    onEdit: openEdit,
    onDelete: deleteTask,
    onReact: reactToTask,
  };

  return (
    <div className="mx-auto min-h-screen max-w-md pb-28 sm:max-w-2xl">
      <header className="px-5 pb-2 pt-8 sm:pt-10">
        <p className="text-sm text-ink-soft">{greeting()}, {role === "OWNER" ? "Dip" : "EITY (His Wife)"} 👋</p>
        <h1 className="font-display text-2xl italic text-ink">TaskMate</h1>
      </header>

      <main className="px-5">
        {tab === "home" && (
          <div className="space-y-6 pt-2">
            <StatsSummary given={given.length} completed={completed.length} completionRate={completionRate} />

            {role === "WORKER" && (
              <div className="rounded-card bg-berry-50 px-4 py-3 text-sm text-berry-700">
                {given.length === 0
                  ? "Nothing on your plate right now 🎉"
                  : `${given.length} task${given.length === 1 ? "" : "s"} left · ${completedToday} completed today`}
              </div>
            )}

            <section>
              <SectionHeader icon="📋" title="Given tasks" count={given.length} />
              <TaskList tasks={given} emptyText="No tasks given yet." {...cardProps} busyId={busyId} />
            </section>

            <section>
              <SectionHeader icon="✓" title="Completed" count={completed.length} />
              <TaskList tasks={completed.slice(0, 5)} emptyText="Nothing completed yet." {...cardProps} busyId={busyId} />
            </section>
          </div>
        )}

        {tab === "given" && (
          <div className="pt-2">
            {role === "WORKER" && (
              <div className="mb-4 rounded-card bg-white px-4 py-3 shadow-soft">
                <p className="text-sm font-medium text-ink">Today&apos;s tasks</p>
                <p className="text-xs text-ink-soft">
                  {given.length} remaining · {completedToday} completed today
                </p>
              </div>
            )}
            <TaskList tasks={given} emptyText="No tasks given yet." {...cardProps} busyId={busyId} />
          </div>
        )}

        {tab === "completed" && (
          <div className="pt-2">
            <TaskList tasks={completed} emptyText="Nothing completed yet." {...cardProps} busyId={busyId} />
          </div>
        )}

        {tab === "settings" && role === "OWNER" && (
          <div className="pt-2">
            <SettingsView role={role} labels={labels} onLabelAdded={(l) => setLabels((prev) => [...prev, l])} />
          </div>
        )}
      </main>

      {role === "OWNER" && (tab === "home" || tab === "given") && (
        <button
          onClick={openCreate}
          className="fixed bottom-24 right-5 z-30 flex items-center gap-2 rounded-full bg-berry-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lift transition active:scale-95 sm:right-[calc(50%-17rem)]"
        >
          <span className="text-lg leading-none" aria-hidden>+</span>
          Give Task
        </button>
      )}

      <BottomNav role={role} active={tab} onChange={setTab} />

      {sheetOpen && (
        <TaskSheet labels={labels} editingTask={editingTask} onClose={closeSheet} onCreate={createTask} onSave={saveTask} />
      )}
    </div>
  );
}

function TaskList({
  tasks,
  emptyText,
  busyId,
  ...cardProps
}: {
  tasks: TaskDTO[];
  emptyText: string;
  busyId: string | null;
  role: Role;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (task: TaskDTO) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string, note: string | null) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-berry-100 bg-white/50 px-5 py-8 text-center text-sm text-ink-soft">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} busy={busyId === task.id} {...cardProps} />
      ))}
    </div>
  );
}
