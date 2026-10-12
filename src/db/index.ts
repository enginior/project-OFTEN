// Server-only database client. Never import this from client components.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure it."
  );
}

// maxConnections is low on purpose: serverless platforms open one client
// per lambda, so a small local pool avoids exhausting Neon/Supabase limits.
const client = postgres(connectionString, { max: 5, idle_timeout: 20 });

export const db = drizzle(client, { schema });
