"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { barbers, barberServices } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canAddBarber } from "@/lib/features/can";
import { barberSchema } from "@/lib/validation/barber";
import { DEFAULT_WORKING_HOURS } from "@/lib/data/working-hours";

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

function buildFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

async function syncBarberServices(barberId: string, serviceIds: string[]) {
  if (serviceIds.length === 0) return;

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

  const [barber] = await db
    .insert(barbers)
    .values({
      organizationId: org.id,
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone ?? null,
      avatarTone: parsed.data.avatarTone,
      workingHours: parsed.data.workingHours,
    })
    .returning({ id: barbers.id });

  await syncBarberServices(barber.id, serviceIds);

  revalidatePath("/barberos");
  return { ok: true };
}

export async function updateBarberAction(
  _prev: BarberActionState,
  formData: FormData
): Promise<BarberActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede editar barberos" };
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

export async function toggleBarberAction(id: string, active: boolean) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") throw new Error("Solo el dueño puede gestionar barberos");

  await db
    .update(barbers)
    .set({ active, updatedAt: new Date() })
    .where(and(eq(barbers.id, id), eq(barbers.organizationId, org.id)));

  revalidatePath("/barberos");
}

export async function deleteBarberAction(id: string) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") throw new Error("Solo el dueño puede eliminar barberos");

  await db
    .delete(barbers)
    .where(and(eq(barbers.id, id), eq(barbers.organizationId, org.id)));

  revalidatePath("/barberos");
}
