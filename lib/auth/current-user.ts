import { redirect } from "next/navigation";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import type { Organization } from "@/lib/db/schema";

export type CurrentContext = {
  user: {
    id: string;
    email: string | null;
  };
  org: Organization;
  role: "owner" | "staff";
};

/**
 * Retorna el usuario autenticado y su organización actual.
 * Redirige a /login si no hay sesión.
 * Redirige a /signup si el user existe pero no tiene org (edge case).
 *
 * Cachea dentro del mismo request vía React.cache().
 */
export const getCurrentOrg = cache(async (): Promise<CurrentContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await db.query.memberships.findFirst({
    where: eq(memberships.userId, user.id),
    with: { organization: true },
  });

  if (!membership) {
    redirect("/signup");
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    org: membership.organization,
    role: membership.role as "owner" | "staff",
  };
});

export async function isOwner(): Promise<boolean> {
  const { role } = await getCurrentOrg();
  return role === "owner";
}
