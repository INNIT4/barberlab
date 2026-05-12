"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { serviceSchema } from "@/lib/validation/service";
import { buildFieldErrors } from "@/lib/validation/helpers";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

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
    imageUrl: formData.get("imageUrl"),
  });
}

export async function createServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede agregar servicios" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `service-create:${org.id}`);
  const { allowed } = await rateLimit(`service-create:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

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
    imageUrl: parsed.data.imageUrl ?? null,
    sortOrder: nextSortOrder,
  });

  revalidatePath("/servicios");
  return { ok: true };
}

export async function updateServiceAction(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede editar servicios" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `service-update:${org.id}`);
  const { allowed } = await rateLimit(`service-update:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

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
      imageUrl: parsed.data.imageUrl ?? null,
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

export async function toggleServiceAction(id: string, active: boolean): Promise<ServiceActionState | void> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede gestionar servicios" };

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `service-toggle:${org.id}`);
  const { allowed } = await rateLimit(`service-toggle:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .update(services)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(services.id, id), eq(services.organizationId, org.id)));

  revalidatePath("/servicios");
  revalidatePath(`/b/${org.slug}`);
}

export async function deleteServiceAction(id: string): Promise<ServiceActionState | void> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede eliminar servicios" };

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `service-delete:${org.id}`);
  const { allowed } = await rateLimit(`service-delete:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.organizationId, org.id)));

  revalidatePath("/servicios");
  revalidatePath(`/b/${org.slug}`);
}
