import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner, requireRole, withAuthError } from "@/lib/auth";

const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH"];

type Params = { params: { id: string } };

/**
 * A single endpoint handles three different mutations because they all act
 * on one task and share the same shape of request. `action` decides which:
 *
 *   { action: "complete" }                 — either role, marks it done
 *   { action: "reopen" }                   — owner only, sends it back to Given
 *   { action: "edit", title, ... }         — owner only, edits the fields given
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  return withAuthError(async () => {
    const { role } = requireRole();
    const body = await req.json().catch(() => null);
    const action = body?.action;

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (action === "complete") {
      // Both Dip and his EITY (His Wife) are allowed to mark something done — she does it
      // from her task list, and Dip can do it too if he finishes something himself.
      if (existing.status === "COMPLETED") {
        return NextResponse.json({ task: existing });
      }
      const task = await prisma.task.update({
        where: { id: params.id },
        data: { status: "COMPLETED", completedAt: new Date() },
        include: { label: true, reaction: true },
      });
      return NextResponse.json({ task });
    }

    if (action === "reopen") {
      if (role !== "OWNER") {
        return NextResponse.json({ error: "Only Dip can reopen a task" }, { status: 403 });
      }
      const task = await prisma.task.update({
        where: { id: params.id },
        data: { status: "GIVEN", completedAt: null },
        include: { label: true, reaction: true },
      });
      return NextResponse.json({ task });
    }

    if (action === "edit") {
      if (role !== "OWNER") {
        return NextResponse.json({ error: "Only Dip can edit tasks" }, { status: 403 });
      }

      const data: Record<string, unknown> = {};

      if (body.title !== undefined) {
        const title = String(body.title).trim();
        if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
        if (title.length > 140) return NextResponse.json({ error: "Title is too long" }, { status: 400 });
        data.title = title;
      }
      if (body.description !== undefined) {
        const description = String(body.description).trim();
        data.description = description.length > 0 ? description : null;
      }
      if (body.priority !== undefined) {
        if (!VALID_PRIORITIES.includes(body.priority)) {
          return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
        }
        data.priority = body.priority;
      }
      if (body.labelId !== undefined) {
        const label = await prisma.label.findUnique({ where: { id: body.labelId } });
        if (!label) return NextResponse.json({ error: "Unknown label" }, { status: 400 });
        data.labelId = body.labelId;
      }

      const task = await prisma.task.update({
        where: { id: params.id },
        data,
        include: { label: true, reaction: true },
      });
      return NextResponse.json({ task });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withAuthError(async () => {
    // Deleting a task is permanent, so this is owner-only, server-verified —
    // a hidden button on the EITY (His Wife)'s screen would not be enough on its own.
    requireOwner();

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
