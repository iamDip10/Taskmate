import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  const expected = process.env.APP_ACCESS_CODE;
  if (!expected) {
    console.error("APP_ACCESS_CODE is not set on the server.");
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  if (!code || code !== expected) {
    return NextResponse.json({ error: "That code isn't right." }, { status: 401 });
  }

  setSession({ authenticated: true, role: null });
  return NextResponse.json({ ok: true });
}
