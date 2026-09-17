import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Dashboard from "@/components/Dashboard";
import type { TaskDTO, LabelDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = getSession();
  if (!session.authenticated) redirect("/login");
  if (!session.role) redirect("/role");

  const [tasks, labels] = await Promise.all([
    prisma.task.findMany({
      include: { label: true, reaction: true },
      orderBy: [{ status: "asc" }, { order: "desc" }, { createdAt: "desc" }],
    }),
    prisma.label.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const taskDTOs: TaskDTO[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    order: t.order,
    createdAt: t.createdAt.toISOString(),
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    label: { id: t.label.id, name: t.label.name, icon: t.label.icon },
    reaction: t.reaction ? { emoji: t.reaction.emoji, note: t.reaction.note } : null,
  }));

  const labelDTOs: LabelDTO[] = labels.map((l) => ({ id: l.id, name: l.name, icon: l.icon }));

  return <Dashboard role={session.role} initialTasks={taskDTOs} labels={labelDTOs} />;
}
