"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export type DangerActionState = {
  error?: string;
  ok?: boolean;
};

export async function deleteAccountAction(): Promise<DangerActionState> {
  const { org, user } = await getCurrentOrg();

  await db
    .delete(organizations)
    .where(
      and(
        eq(organizations.id, org.id)
      )
    );

  const supabase = await createClient();
  await supabase.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();

  redirect("/login");
}
