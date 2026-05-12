"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { appointments, customers, services, barbers, notifications } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { dayKeyFromDate, type WorkingHours } from "@/lib/data/working-hours";
import {
  appointmentSchema,
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/lib/validation/appointment";
import { buildFieldErrors } from "@/lib/validation/helpers";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export type AppointmentActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

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

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `apt-create:${org.id}`);
  const { allowed } = await rateLimit(`apt-create:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiadas citas. Espera un minuto." };

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

  const customerId = data.customerId && data.customerId.length > 0 ? data.customerId : null;

  try {
    await db.transaction(async (tx) => {
      let cid = customerId;

      if (!cid) {
        const name = data.newCustomerName?.trim() ?? "";
        const phone = data.newCustomerPhone?.trim() ?? "";

        const existing = await tx.query.customers.findFirst({
          where: and(
            eq(customers.organizationId, org.id),
            eq(customers.phone, phone)
          ),
        });

        if (existing) {
          cid = existing.id;
        } else {
          const [created] = await tx
            .insert(customers)
            .values({
              organizationId: org.id,
              name,
              phone,
              tag: "Nuevo",
            })
            .returning({ id: customers.id });
          cid = created.id;
        }
      }

      await tx.insert(appointments).values({
        organizationId: org.id,
        barberId: data.barberId,
        serviceId: data.serviceId,
        customerId: cid!,
        startsAt,
        endsAt,
        status: "confirmada",
        priceMxn: service.priceMxn,
        notes: data.notes && data.notes.length > 0 ? data.notes : null,
      });

      await tx.insert(notifications).values({
        organizationId: org.id,
        title: "Cita agendada",
        body: `${data.newCustomerName || "Cliente"} — ${service.name}`,
      });
    });
  } catch (err) {
    if (isExclusionViolation(err)) {
      return { error: "El barbero ya tiene una cita en ese horario" };
    }
    if (isUniqueViolation(err)) {
      return {
        error: "Ya hay un cliente con ese teléfono",
        fieldErrors: { newCustomerPhone: "Teléfono ya registrado" },
      };
    }
    throw err;
  }

  revalidatePath("/agenda");
  return { ok: true };
}

const statusUpdateSchema = z.object({
  id: z.string().uuid("ID inválido"),
  status: z.enum(APPOINTMENT_STATUSES),
});

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
) {
  const { org } = await getCurrentOrg();

  const parsed = statusUpdateSchema.safeParse({ id, status });
  if (!parsed.success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `apt-status:${org.id}`);
  const { allowed } = await rateLimit(`apt-status:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .update(appointments)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(
      and(eq(appointments.id, parsed.data.id), eq(appointments.organizationId, org.id))
    );

  await db.insert(notifications).values({
    organizationId: org.id,
    title: `Cita ${parsed.data.status}`,
    body: `La cita fue marcada como "${parsed.data.status}".`,
  });

  revalidatePath("/agenda");
}

const rescheduleSchema = z.object({
  id: z.string().uuid("ID inválido"),
  barberId: z.string().uuid("Barbero inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
});

export async function rescheduleAppointmentAction(
  raw: z.infer<typeof rescheduleSchema>
): Promise<AppointmentActionState> {
  const { org } = await getCurrentOrg();

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `apt-reschedule:${org.id}`);
  const { allowed } = await rateLimit(`apt-reschedule:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return { error: "Demasiados cambios. Espera un minuto." };

  const parsed = rescheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos", fieldErrors: buildFieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  const apt = await db.query.appointments.findFirst({
    where: and(eq(appointments.id, data.id), eq(appointments.organizationId, org.id)),
  });

  if (!apt) return { error: "Cita no encontrada" };

  const svc = await db.query.services.findFirst({
    where: and(eq(services.id, apt.serviceId!), eq(services.organizationId, org.id)),
  });
  if (!svc) return { error: "Servicio no encontrado" };

  const newBarber = await db.query.barbers.findFirst({
    where: and(eq(barbers.id, data.barberId), eq(barbers.organizationId, org.id)),
  });
  if (!newBarber) return { error: "Barbero no encontrado" };

  const startsAt = fromZonedTime(`${data.date} ${data.time}:00`, org.timezone);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Fecha u hora inválida" };
  }
  const endsAt = new Date(startsAt.getTime() + svc.durationMinutes * 60_000);

  const whError = validateWorkingHours(
    newBarber.workingHours as WorkingHours | null,
    data.date,
    data.time,
    org.timezone
  );
  if (whError) return { error: whError, fieldErrors: { time: whError } };

  try {
    await db
      .update(appointments)
      .set({
        barberId: data.barberId,
        startsAt,
        endsAt,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, data.id), eq(appointments.organizationId, org.id)));

    await db.insert(notifications).values({
      organizationId: org.id,
      title: "Cita reagendada",
      body: `La cita se movió para ${data.date} a las ${data.time}.`,
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

export async function deleteAppointmentAction(id: string) {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return;

  if (!z.string().uuid().safeParse(id).success) return;

  const headersList = await headers();
  const ip = getRateLimitKey(headersList, `apt-delete:${org.id}`);
  const { allowed } = await rateLimit(`apt-delete:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) return;

  await db
    .delete(appointments)
    .where(
      and(eq(appointments.id, id), eq(appointments.organizationId, org.id))
    );

  revalidatePath("/agenda");
}
