"use server";

import { revalidatePath } from "next/cache";
import { and, eq, lt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/rate-limit";

const inviteEmailSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type InviteActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

export async function createInvitationAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const { org } = await getCurrentOrg();

  const { allowed } = await rateLimit(`invite:${org.id}`, { maxRequests: 10, windowMs: 24 * 60 * 60_000 });
  if (!allowed) {
    return { error: "Límite de invitaciones alcanzado. Intenta mañana." };
  }

  const parsed = inviteEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Ingresa un email válido", fieldErrors: { email: "Email inválido" } };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const token = randomBytes(32).toString("hex");

  await db.insert(invitations).values({
    organizationId: org.id,
    email: parsed.data.email,
    role: "staff",
    token,
    expiresAt,
  });

  revalidatePath("/barberos");
  return { ok: true };
}

export async function deleteInvitationAction(id: string) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") throw new Error("Solo el dueño puede gestionar invitaciones");
  await db
    .delete(invitations)
    .where(
      and(eq(invitations.id, id), eq(invitations.organizationId, org.id))
    );
  revalidatePath("/barberos");
}
