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
    // El user existe en auth.users pero no tiene organización.
    // Esto solo debería pasar si el signup falló a medias.
    redirect("/signup");
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    org: membership.organization,
  };
});
