import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/session";
import { withAuthError, requireAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return withAuthError(async () => {
    requireAuthenticated();
    const body = await req.json().catch(() => null);
    const role = body?.role;

    if (role !== "OWNER" && role !== "WORKER") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const session = getSession();
    setSession({ ...session, role });
    return NextResponse.json({ ok: true });
  });
}
