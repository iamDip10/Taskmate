import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner, requireRole, withAuthError } from "@/lib/auth";

export async function GET() {
  return withAuthError(async () => {
    requireRole();
    const labels = await prisma.label.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ labels });
  });
}

export async function POST(req: NextRequest) {
  return withAuthError(async () => {
    // Managing the label list is a settings action — owner only.
    requireOwner();

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const icon = typeof body?.icon === "string" && body.icon.trim() ? body.icon.trim() : "📌";

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (name.length > 30) return NextResponse.json({ error: "Name is too long" }, { status: 400 });

    const existing = await prisma.label.findUnique({ where: { name } });
    if (existing) return NextResponse.json({ error: "That label already exists" }, { status: 409 });

    const label = await prisma.label.create({ data: { name, icon } });
    return NextResponse.json({ label }, { status: 201 });
  });
}
