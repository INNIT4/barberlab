"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export type DangerActionState = {
  error?: string;
  ok?: boolean;
};

export async function deleteAccountAction(): Promise<DangerActionState> {
  const { org, user, role } = await getCurrentOrg();

  if (role !== "owner") {
    return { error: "Solo el dueño puede eliminar la cuenta" };
  }

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `danger:${org.id}`);
  const { allowed } = await rateLimit(`danger:${ip}`, { maxRequests: 3, windowMs: 60 * 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Intenta más tarde." };

  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    await adminSupabase.auth.admin.deleteUser(user.id);
  } catch {
    return { error: "No se pudo eliminar la cuenta. Intenta de nuevo." };
  }

  await db
    .delete(organizations)
    .where(
      and(
        eq(organizations.id, org.id)
      )
    );

  redirect("/login");
}
