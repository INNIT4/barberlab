"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";

export type DangerActionState = {
  error?: string;
  ok?: boolean;
};

export async function deleteAccountAction(): Promise<DangerActionState> {
  const { org, user, role } = await getCurrentOrg();

  if (role !== "owner") {
    return { error: "Solo el dueño puede eliminar la cuenta" };
  }

  await db
    .delete(organizations)
    .where(
      and(
        eq(organizations.id, org.id)
      )
    );

  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  await adminSupabase.auth.admin.deleteUser(user.id);

  redirect("/login");
}
