import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner, requireRole, withAuthError } from "@/lib/auth";

const VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH"];

export async function GET() {
  return withAuthError(async () => {
    requireRole();
    const tasks = await prisma.task.findMany({
      include: { label: true, reaction: true },
      orderBy: [{ status: "asc" }, { order: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  });
}

export async function POST(req: NextRequest) {
  return withAuthError(async () => {
    // Only Dip (OWNER) can hand out new tasks — enforced here, not just hidden in the UI.
    requireOwner();

    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : null;
    const labelId = typeof body?.labelId === "string" ? body.labelId : "";
    const priority = VALID_PRIORITIES.includes(body?.priority) ? body.priority : "NORMAL";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 140) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }
    if (!labelId) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }

    const label = await prisma.label.findUnique({ where: { id: labelId } });
    if (!label) {
      return NextResponse.json({ error: "Unknown label" }, { status: 400 });
    }

    const highestOrder = await prisma.task.aggregate({
      _max: { order: true },
      where: { status: "GIVEN" },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        labelId,
        priority,
        order: (highestOrder._max.order ?? 0) + 1,
      },
      include: { label: true, reaction: true },
    });

    return NextResponse.json({ task }, { status: 201 });
  });
}
