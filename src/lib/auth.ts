// Session management for the single-admin login.
//
// Sessions are stateless HS256 JWTs signed with AUTH_SECRET and stored in
// an HttpOnly, SameSite=Lax cookie. No authentication cryptography is
// hand-rolled: `jose` (edge-compatible) signs/verifies the tokens, and
// password hashing lives exclusively in server code via bcryptjs.
//
// This module is safe to import from the proxy (edge runtime) for
// read-only verification; anything that touches the database or bcrypt
// must stay in server components/actions.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "hephaestus_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ISSUER = "hephaestus-automaton";
const AUDIENCE = "hephaestus-admin";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is not set or is shorter than 32 characters. " +
        "Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE_SECONDS)
    .sign(getAuthSecret());
}

/** Returns the admin user id if the token is valid, otherwise null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    // Invalid, expired, or tampered token — treat as anonymous.
    return null;
  }
}

export type AdminSession = { userId: string };

export async function getCurrentSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const userId = await verifySessionToken(token);
  return userId ? { userId } : null;
}

// Authoritative authorization check for admin pages and mutations. The
// proxy guard is convenience only; every protected read and action must
// call this (or getCurrentSession) on the server.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
