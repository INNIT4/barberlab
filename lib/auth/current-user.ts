import { redirect } from "next/navigation";
import { cache } from "react";
import { eq, lt, and, ne } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { memberships, organizations } from "@/lib/db/schema";
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
 * Si el trial expiró y no hay subscripción de Stripe, downgradea a starter.
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

  let org = membership.organization;

  // Enforce trial expiry: downgrade to starter if trial ended and no Stripe subscription
  if (
    org.trialEndsAt &&
    org.trialEndsAt < new Date() &&
    org.plan !== "starter" &&
    !org.stripeSubscriptionId
  ) {
    const [updated] = await db
      .update(organizations)
      .set({ plan: "starter", trialEndsAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(organizations.id, org.id),
          lt(organizations.trialEndsAt, new Date()),
          eq(organizations.plan, org.plan),
          ne(organizations.plan, "starter")
        )
      )
      .returning();
    if (updated) org = updated;
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    org,
    role: membership.role as "owner" | "staff",
  };
});

export async function isOwner(): Promise<boolean> {
  const { role } = await getCurrentOrg();
  return role === "owner";
}
