import postgres from "postgres";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

const file = readFileSync(join(process.cwd(), "drizzle", "0003_0003_blog.sql"), "utf-8");

async function main() {
  const statements = file.split("--> statement-breakpoint").map((s) => s.trim());
  for (const stmt of statements) {
    if (stmt.length > 0) {
      await sql.unsafe(stmt);
    }
  }
  console.log("Blog migration applied successfully");
  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
