import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  const rows = await sql`
    select relname, relrowsecurity as rls, relforcerowsecurity as forced
    from pg_class
    where relname in ('users','categories','tags','entries','entry_tags')
    order by relname
  `;
  console.table(rows);
  const n = await sql`select count(*)::int as published from entries where status = 'published'`;
  console.log("published entries:", n[0].published);
  await sql.end();
}

main();
