"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import type { z } from "zod";
import { db } from "@/lib/db";
import { appointments, customers, services, barbers } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { dayKeyFromDate, type WorkingHours } from "@/lib/data/working-hours";
import {
  appointmentSchema,
  type AppointmentStatus,
} from "@/lib/validation/appointment";

export type AppointmentActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function buildFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

function isExclusionViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23P01"
  );
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

function validateWorkingHours(
  wh: WorkingHours | null,
  date: string,
  time: string,
  tz: string
): string | null {
  if (!wh) return null;

  const localDate = fromZonedTime(`${date} ${time}:00`, tz);
  if (Number.isNaN(localDate.getTime())) return null;

  const dayKey = dayKeyFromDate(localDate);
  const schedule = wh[dayKey];

  if (!schedule) {
    const dayNames: Record<string, string> = {
      mon: "lunes", tue: "martes", wed: "miércoles",
      thu: "jueves", fri: "viernes", sat: "sábado", sun: "domingo",
    };
    return `El barbero no trabaja el ${dayNames[dayKey] ?? dayKey}`;
  }

  const [startH, startM] = schedule.start.split(":").map(Number);
  const [endH, endM] = schedule.end.split(":").map(Number);
  const scheduleStart = startH * 60 + startM;
  const scheduleEnd = endH * 60 + endM;

  const [aptH, aptM] = time.split(":").map(Number);
  const aptMinutes = aptH * 60 + aptM;

  if (aptMinutes < scheduleStart || aptMinutes >= scheduleEnd) {
    const fmtTime = (t: string) => {
      const [h, m] = t.split(":");
      return `${h}:${m}`;
    };
    return `El barbero atiende de ${fmtTime(schedule.start)} a ${fmtTime(schedule.end)}`;
  }

  return null;
}

export async function createAppointmentAction(
  _prev: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const { org } = await getCurrentOrg();

  const parsed = appointmentSchema.safeParse({
    barberId: formData.get("barberId"),
    serviceId: formData.get("serviceId"),
    customerId: formData.get("customerId") ?? "",
    newCustomerName: formData.get("newCustomerName") ?? "",
    newCustomerPhone: formData.get("newCustomerPhone") ?? "",
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  const [service, barber] = await Promise.all([
    db.query.services.findFirst({
      where: and(
        eq(services.id, data.serviceId),
        eq(services.organizationId, org.id)
      ),
    }),
    db.query.barbers.findFirst({
      where: and(
        eq(barbers.id, data.barberId),
        eq(barbers.organizationId, org.id)
      ),
    }),
  ]);

  if (!service) {
    return { error: "Servicio no encontrado" };
  }

  if (!barber) {
    return { error: "Barbero no encontrado" };
  }

  const startsAt = fromZonedTime(`${data.date} ${data.time}:00`, org.timezone);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Fecha u hora inválida" };
  }
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  // Validar horarios laborales del barbero
  const whError = validateWorkingHours(barber.workingHours as WorkingHours | null, data.date, data.time, org.timezone);
  if (whError) {
    return { error: whError, fieldErrors: { time: whError } };
  }

  let customerId = data.customerId && data.customerId.length > 0 ? data.customerId : null;

  if (!customerId) {
    const name = data.newCustomerName?.trim() ?? "";
    const phone = data.newCustomerPhone?.trim() ?? "";

    const existing = await db.query.customers.findFirst({
      where: and(
        eq(customers.organizationId, org.id),
        eq(customers.phone, phone)
      ),
    });

    if (existing) {
      customerId = existing.id;
    } else {
      try {
        const [created] = await db
          .insert(customers)
          .values({
            organizationId: org.id,
            name,
            phone,
            tag: "Nuevo",
          })
          .returning({ id: customers.id });
        customerId = created.id;
      } catch (err) {
        if (isUniqueViolation(err)) {
          return {
            error: "Ya hay un cliente con ese teléfono",
            fieldErrors: { newCustomerPhone: "Teléfono ya registrado" },
          };
        }
        throw err;
      }
    }
  }

  try {
    await db.insert(appointments).values({
      organizationId: org.id,
      barberId: data.barberId,
      serviceId: data.serviceId,
      customerId,
      startsAt,
      endsAt,
      status: "confirmada",
      priceMxn: service.priceMxn,
      notes: data.notes && data.notes.length > 0 ? data.notes : null,
    });
  } catch (err) {
    if (isExclusionViolation(err)) {
      return { error: "El barbero ya tiene una cita en ese horario" };
    }
    throw err;
  }

  revalidatePath("/agenda");
  return { ok: true };
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
) {
  const { org } = await getCurrentOrg();

  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(appointments.id, id), eq(appointments.organizationId, org.id))
    );

  revalidatePath("/agenda");
}

export async function deleteAppointmentAction(id: string) {
  const { org } = await getCurrentOrg();

  await db
    .delete(appointments)
    .where(
      and(eq(appointments.id, id), eq(appointments.organizationId, org.id))
    );

  revalidatePath("/agenda");
}
