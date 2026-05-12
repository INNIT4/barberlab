const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const REQUIRED_PUBLIC = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateEnv(): void {
  if (process.env.NODE_ENV === "development") return;

  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  const missingPublic = REQUIRED_PUBLIC.filter((v) => !process.env[v]);

  if (missing.length > 0 || missingPublic.length > 0) {
    const allMissing = [...missing, ...missingPublic];
    throw new Error(
      `Missing required environment variables: ${allMissing.join(", ")}`
    );
  }
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "development") {
      throw new Error(`Missing env var: ${key}. Check .env.local`);
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://barberlab.app"
      : "http://localhost:3000")
  );
}
