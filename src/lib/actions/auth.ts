"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";
import { rateLimit, RATE_LIMIT_LOGIN } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

// Hashed once, lazily, on first need. Compared against when the email is
// unknown so failed logins take roughly constant time whether or not the
// account exists (no user-enumeration timing oracle).
let dummyHash: string | null = null;
function getDummyHash(): string {
  dummyHash ||= bcrypt.hashSync(crypto.randomUUID(), 12);
  return dummyHash;
}

async function clientKey(): Promise<string> {
  // Vercel provides the real client IP here; fall back for local dev.
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : undefined;
  return ip ?? "local";
}

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const key = await clientKey();
  const rl = rateLimit(`login:${key}`, RATE_LIMIT_LOGIN);
  if (!rl.ok) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const { email, password } = parsed.data;
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const ok = await bcrypt.compare(
    password,
    user ? user.passwordHash : getDummyHash(),
  );
  if (!user || !ok) {
    return { error: "Invalid email or password." };
  }

  const token = await createSessionToken(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
