import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(url, { prepare: false });

async function main() {
  console.log("Applying branding columns to organizations...");
  await client.unsafe(`
    ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS address_notes TEXT,
      ADD COLUMN IF NOT EXISTS tagline TEXT,
      ADD COLUMN IF NOT EXISTS about TEXT,
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
      ADD COLUMN IF NOT EXISTS primary_color TEXT,
      ADD COLUMN IF NOT EXISTS instagram_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT,
      ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
      ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
      ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
  `);
  console.log("Done.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
