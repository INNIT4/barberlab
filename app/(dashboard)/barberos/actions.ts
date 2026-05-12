"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { barbers, barberServices } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canAddBarber } from "@/lib/features/can";
import { barberSchema } from "@/lib/validation/barber";
import { buildFieldErrors } from "@/lib/validation/helpers";
import { DEFAULT_WORKING_HOURS } from "@/lib/data/working-hours";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export type BarberActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function parseWorkingHours(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.length === 0) return DEFAULT_WORKING_HOURS;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WORKING_HOURS;
  }
}

function parseServiceIds(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function parseFormData(formData: FormData) {
  return barberSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role") || "Barbero",
    phone: formData.get("phone"),
    avatarTone: formData.get("avatarTone") || undefined,
    workingHours: parseWorkingHours(formData.get("workingHours")),
  });
}

async function syncBarberServices(barberId: string, serviceIds: string[]) {
  await db.transaction(async (tx) => {
    await tx
      .delete(barberServices)
      .where(eq(barberServices.barberId, barberId));

    if (serviceIds.length > 0) {
      await tx.insert(barberServices).values(
        serviceIds.map((sid) => ({ barberId, serviceId: sid }))
      );
    }
  });
}

export async function createBarberAction(
  _prev: BarberActionState,
  formData: FormData
): Promise<BarberActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede agregar barberos" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `barber-create:${org.id}`);
  const { allowed } = await rateLimit(`barber-create:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const [{ current }] = await db
    .select({ current: count() })
    .from(barbers)
    .where(eq(barbers.organizationId, org.id));

  if (!canAddBarber(org.plan, current)) {
    return {
      error:
        "Alcanzaste el límite de barberos de tu plan. Actualiza para agregar más.",
    };
  }

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const serviceIds = parseServiceIds(formData.get("serviceIds"));

  await db.transaction(async (tx) => {
    await tx.insert(barbers).values({
      organizationId: org.id,
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone ?? null,
      avatarTone: parsed.data.avatarTone,
      workingHours: parsed.data.workingHours,
    });

    if (serviceIds.length > 0) {
      const all = await tx
        .select({ id: barbers.id })
        .from(barbers)
        .where(eq(barbers.organizationId, org.id))
        .orderBy(desc(barbers.createdAt))
        .limit(1);
      const barberId = all[0]?.id;
      if (barberId) {
        await tx.insert(barberServices).values(
          serviceIds.map((sid) => ({ barberId, serviceId: sid }))
        );
      }
    }
  });

  revalidatePath("/barberos");
  return { ok: true };
}

export async function updateBarberAction(
  _prev: BarberActionState,
  formData: FormData
): Promise<BarberActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede editar barberos" };

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `barber-update:${org.id}`);
  const { allowed } = await rateLimit(`barber-update:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados intentos. Espera un minuto." };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Barbero inválido" };
  }

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const serviceIds = parseServiceIds(formData.get("serviceIds"));

  const [updated] = await db
    .update(barbers)
    .set({
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone ?? null,
      avatarTone: parsed.data.avatarTone,
      workingHours: parsed.data.workingHours,
      updatedAt: new Date(),
    })
    .where(and(eq(barbers.id, id), eq(barbers.organizationId, org.id)))
    .returning({ id: barbers.id });

  if (!updated) {
    return { error: "Barbero no encontrado" };
  }

  await syncBarberServices(id, serviceIds);

  revalidatePath("/barberos");
  return { ok: true };
}

export async function toggleBarberAction(id: string, active: boolean): Promise<BarberActionState | void> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede gestionar barberos" };

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `barber-toggle:${org.id}`);
  const { allowed } = await rateLimit(`barber-toggle:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .update(barbers)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(barbers.id, id), eq(barbers.organizationId, org.id)));

  revalidatePath("/barberos");
  revalidatePath(`/b/${org.slug}`);
}

export async function deleteBarberAction(id: string): Promise<BarberActionState | void> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede eliminar barberos" };

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `barber-delete:${org.id}`);
  const { allowed } = await rateLimit(`barber-delete:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .delete(barbers)
    .where(and(eq(barbers.id, id), eq(barbers.organizationId, org.id)));

  revalidatePath("/barberos");
  revalidatePath(`/b/${org.slug}`);
}
