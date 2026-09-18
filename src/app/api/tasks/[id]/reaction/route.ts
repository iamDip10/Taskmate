import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner, withAuthError } from "@/lib/auth";
import { REACTION_EMOJIS } from "@/types";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  return withAuthError(async () => {
    // Reacting is Dip's private feedback to his EITY (His Wife) — owner-only.
    requireOwner();

    const body = await req.json().catch(() => null);
    const emoji = body?.emoji;
    const note =
      typeof body?.note === "string" && body.note.trim().length > 0 ? body.note.trim() : null;

    if (!REACTION_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: "Unknown emoji" }, { status: 400 });
    }
    if (note && note.length > 200) {
      return NextResponse.json({ error: "Note is too long" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.status !== "COMPLETED") {
      return NextResponse.json({ error: "Only completed tasks can be reacted to" }, { status: 400 });
    }

    const reaction = await prisma.reaction.upsert({
      where: { taskId: params.id },
      update: { emoji, note },
      create: { taskId: params.id, emoji, note },
    });

    return NextResponse.json({ reaction });
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return withAuthError(async () => {
    requireOwner();
    await prisma.reaction.deleteMany({ where: { taskId: params.id } });
    return NextResponse.json({ ok: true });
  });
}
