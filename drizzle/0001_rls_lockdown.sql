-- Row Level Security lockdown.
--
-- The application connects as the table owner via the privileged
-- DATABASE_URL (Drizzle, server-side only), so it bypasses RLS by
-- default. Enabling RLS with NO policies blocks every other role
-- (e.g. Supabase's anon/authenticated keys) from reading or writing
-- any table directly. There are intentionally no public policies:
-- public visitors must go through the app's server-rendered queries.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entry_tags" ENABLE ROW LEVEL SECURITY;
