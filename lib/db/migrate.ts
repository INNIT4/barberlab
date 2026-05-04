import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL no definida");

async function main() {
  const sql = postgres(DATABASE_URL!, { prepare: false, max: 1 });

  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Encontrados ${files.length} archivos de migración`);

  for (const file of files) {
    console.log(`\n→ Aplicando ${file}`);
    const content = readFileSync(join(dir, file), "utf8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
      } catch (err: any) {
        // Ignorar errores de "already exists" para hacer la migración idempotente
        if (
          err.code === "42P07" || // relation already exists
          err.code === "42710" || // duplicate_object
          err.code === "42701" || // duplicate_column
          err.code === "42P06" || // duplicate_schema
          err.code === "42723" || // duplicate_function
          err.message?.includes("already exists")
        ) {
          console.log(`  (skip) ${err.message.split("\n")[0]}`);
          continue;
        }
        console.error(`  ✗ Error en statement:`);
        console.error(stmt.slice(0, 200));
        throw err;
      }
    }
    console.log(`  ✓ ${file} aplicado`);
  }

  await sql.end();
  console.log("\n✓ Migración completa");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
