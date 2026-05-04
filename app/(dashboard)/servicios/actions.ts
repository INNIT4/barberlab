"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { serviceSchema } from "@/lib/validation/service";

export type ServiceActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function parseFormData(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    durationMinutes: formData.get("durationMinutes"),
    priceMxn: formData.get("priceMxn"),
  });
}

function buildFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

export async function createServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const { org } = await getCurrentOrg();
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const lastSortOrder = await db
    .select({ sortOrder: services.sortOrder })
    .from(services)
    .where(eq(services.organizationId, org.id))
    .orderBy(desc(services.sortOrder))
    .limit(1);

  const nextSortOrder = (lastSortOrder[0]?.sortOrder ?? 0) + 1;

  await db.insert(services).values({
    organizationId: org.id,
    name: parsed.data.name,
    category: parsed.data.category,
    durationMinutes: parsed.data.durationMinutes,
    priceMxn: parsed.data.priceMxn,
    sortOrder: nextSortOrder,
  });

  revalidatePath("/servicios");
  return { ok: true };
}

export async function updateServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const { org } = await getCurrentOrg();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Servicio inválido" };
  }

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const [updated] = await db
    .update(services)
    .set({
      name: parsed.data.name,
      category: parsed.data.category,
      durationMinutes: parsed.data.durationMinutes,
      priceMxn: parsed.data.priceMxn,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, id), eq(services.organizationId, org.id)))
    .returning({ id: services.id });

  if (!updated) {
    return { error: "Servicio no encontrado" };
  }

  revalidatePath("/servicios");
  return { ok: true };
}

export async function toggleServiceAction(id: string, active: boolean) {
  const { org } = await getCurrentOrg();

  await db
    .update(services)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(services.id, id), eq(services.organizationId, org.id)));

  revalidatePath("/servicios");
}

export async function deleteServiceAction(id: string) {
  const { org } = await getCurrentOrg();

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.organizationId, org.id)));

  revalidatePath("/servicios");
}
