import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname='public' ORDER BY tablename
  `;
  console.log(
    "Tablas:",
    tables.map((r) => r.tablename)
  );

  const ext =
    await sql`SELECT extname FROM pg_extension WHERE extname='btree_gist'`;
  console.log("btree_gist:", ext.length > 0 ? "OK" : "FALTA");

  const cons =
    await sql`SELECT conname FROM pg_constraint WHERE conname='appointments_no_overlap'`;
  console.log("EXCLUDE constraint:", cons.length > 0 ? "OK" : "FALTA");

  const pol = await sql`
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' ORDER BY tablename
  `;
  console.log("RLS policies:", pol.length);
  pol.forEach((p) => console.log(`  - ${p.tablename}: ${p.policyname}`));

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
