import { NextResponse } from "next/server";
import { clearSession, getSession, setSession } from "@/lib/session";

/**
 * POST { mode: "role" }  -> keep the access-code unlock, forget the chosen role
 * POST { mode: "full" }  -> forget everything, back to the access code screen
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ mode: "full" }));

  if (body?.mode === "role") {
    const session = getSession();
    setSession({ ...session, role: null });
  } else {
    clearSession();
  }

  return NextResponse.json({ ok: true });
}
