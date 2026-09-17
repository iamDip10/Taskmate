import { NextResponse } from "next/server";
import { getSession, type Role } from "./session";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Throws unless the current device is authenticated (past the access-code gate). */
export function requireAuthenticated() {
  const session = getSession();
  if (!session.authenticated) {
    throw new AuthError("Not authenticated", 401);
  }
  return session;
}

/** Throws unless the current device is signed in as OWNER (Dip). */
export function requireOwner() {
  const session = requireAuthenticated();
  if (session.role !== "OWNER") {
    throw new AuthError("This action is owner-only", 403);
  }
  return session;
}

/** Throws unless a role has been chosen at all — used by mutation routes both roles can call. */
export function requireRole(): { role: Role } {
  const session = requireAuthenticated();
  if (!session.role) {
    throw new AuthError("No role selected", 401);
  }
  return { role: session.role };
}

/** Wraps a route handler body so AuthError becomes a clean JSON error response. */
export async function withAuthError(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
