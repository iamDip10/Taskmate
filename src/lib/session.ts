import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * A tiny, dependency-free signed-cookie session.
 *
 * We deliberately don't pull in a full auth framework for a two-person app.
 * The cookie holds a small JSON payload plus an HMAC signature, so a client
 * can't forge or edit `role` (e.g. to grant themselves OWNER) without
 * knowing SESSION_SECRET, which only ever lives on the server.
 */

export type Role = "OWNER" | "WORKER";

export type SessionPayload = {
  /** True once the correct access code has been entered on this device. */
  authenticated: boolean;
  /** Set only after a role has been chosen on the /role screen. */
  role: Role | null;
};

const COOKIE_NAME = "taskmate_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days — this is a private, trusted device.

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to your environment variables (see .env.local.example)."
    );
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encode(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, "utf8").toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  // Constant-time compare to avoid timing side-channels on the signature check.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as SessionPayload;
    if (typeof parsed.authenticated !== "boolean") return null;
    if (parsed.role !== "OWNER" && parsed.role !== "WORKER" && parsed.role !== null) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie for the current request. */
export function getSession(): SessionPayload {
  const token = cookies().get(COOKIE_NAME)?.value;
  return decode(token) ?? { authenticated: false, role: null };
}

/** Writes a new signed session cookie, HTTP-only so client JS can't read or edit it. */
export function setSession(payload: SessionPayload) {
  cookies().set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Clears the session entirely — used by "Reset local session". */
export function clearSession() {
  cookies().delete(COOKIE_NAME);
}
