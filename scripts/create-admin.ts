// One-time (repeatable) admin creation CLI. Per AGENTS.md, the seed never
// creates credentials — this script is the only supported way to provision
// the admin account.
//
// Usage:
//   npm run admin:create -- --email you@example.com --password 'long-secret'
// or provide ADMIN_EMAIL / ADMIN_PASSWORD env vars. Re-running with the
// same email resets that account's password.
//
// The password is hashed with bcrypt (cost 12) before it touches the
// database; plaintext is never stored or logged.

import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { users } from "./schema";

function argValue(flag: string): string | undefined {
  const argv = process.argv;
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

const email = (argValue("--email") ?? process.env.ADMIN_EMAIL ?? "")
  .trim()
  .toLowerCase();
const password = argValue("--password") ?? process.env.ADMIN_PASSWORD ?? "";

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Error: --email must be a valid email address.");
  process.exit(1);
}
if (password.length < 12) {
  console.error(
    "Error: --password must be at least 12 characters. Use a long random value, e.g. `openssl rand -base64 24`."
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "Error: DATABASE_URL is not set. Copy .env.example to .env and configure it."
  );
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12);

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

try {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, updatedAt: new Date() },
    })
    .returning({ id: users.id, email: users.email });

  console.log(
    user.email === email
      ? `Admin account ready: ${user.email} (id: ${user.id})`
      : "Unexpected result — verify the users table manually."
  );
} catch (error) {
  console.error("Failed to create admin account:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
