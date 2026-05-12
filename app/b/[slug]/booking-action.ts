"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  appointments,
  barbers,
  customers,
  organizations,
  services,
} from "@/lib/db/schema";
import {
  dayKeyFromDate,
  type WorkingHours,
} from "@/lib/data/working-hours";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { notifications } from "@/lib/db/schema";

const bookingSchema = z.object({
  slug: z.string(),
  barberId: z.string().uuid("Selecciona un barbero"),
  serviceId: z.string().uuid("Selecciona un servicio"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  customerName: z.string().min(2, "Ingresa tu nombre"),
  customerPhone: z.string().min(8, "Ingresa tu teléfono"),
});

export type BookingState = {
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

export async function createPublicBookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const headersList = await headers();
  const ip = getRateLimitKey(headersList, "booking");
  const { allowed } = await rateLimit(`booking:${ip}`, { maxRequests: 10, windowMs: 15 * 60_000 });
  if (!allowed) {
    return { error: "Demasiadas reservas. Intenta de nuevo en 15 minutos." };
  }

  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    barberId: formData.get("barberId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    time: formData.get("time"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { error: "Revisa los datos ingresados", fieldErrors };
  }

  const data = parsed.data;

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, data.slug),
  });
  if (!org) return { error: "Barbería no encontrada" };

  const [service, barber] = await Promise.all([
    db.query.services.findFirst({
      where: and(
        eq(services.id, data.serviceId),
        eq(services.organizationId, org.id),
        eq(services.active, true)
      ),
    }),
    db.query.barbers.findFirst({
      where: and(
        eq(barbers.id, data.barberId),
        eq(barbers.organizationId, org.id),
        eq(barbers.active, true)
      ),
    }),
  ]);

  if (!service) return { error: "Servicio no encontrado", fieldErrors: { serviceId: "Selecciona un servicio válido" } };
  if (!barber) return { error: "Barbero no encontrado", fieldErrors: { barberId: "Selecciona un barbero válido" } };

  const tz = org.timezone;
  const startsAt = fromZonedTime(`${data.date} ${data.time}:00`, tz);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Fecha u hora inválida" };
  }
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  // Validar horarios
  const wh = barber.workingHours as WorkingHours | null;
  if (wh) {
    const dayKey = dayKeyFromDate(startsAt);
    const schedule = wh[dayKey];
    if (!schedule) {
      return { error: "El barbero no trabaja ese día", fieldErrors: { date: "Elige otro día" } };
    }
    const [sH, sM] = schedule.start.split(":").map(Number);
    const [eH, eM] = schedule.end.split(":").map(Number);
    const schedStart = sH * 60 + sM;
    const schedEnd = eH * 60 + eM;
    const [aH, aM] = data.time.split(":").map(Number);
    const aptMin = aH * 60 + aM;
    if (aptMin < schedStart || aptMin + service.durationMinutes > schedEnd) {
      return {
        error: `El barbero atiende de ${schedule.start} a ${schedule.end}`,
        fieldErrors: { time: "Fuera del horario" },
      };
    }
  }

  try {
    await db.transaction(async (tx) => {
      const existingCustomer = await tx.query.customers.findFirst({
        where: and(
          eq(customers.organizationId, org.id),
          eq(customers.phone, data.customerPhone.trim())
        ),
      });

      let cid: string;
      if (existingCustomer) {
        cid = existingCustomer.id;
      } else {
        const [created] = await tx
          .insert(customers)
          .values({
            organizationId: org.id,
            name: data.customerName.trim(),
            phone: data.customerPhone.trim(),
            tag: "Nuevo",
          })
          .returning({ id: customers.id });
        cid = created.id;
      }

      await tx.insert(appointments).values({
        organizationId: org.id,
        barberId: data.barberId,
        serviceId: data.serviceId,
        customerId: cid,
        startsAt,
        endsAt,
        status: "confirmada",
        priceMxn: service.priceMxn,
      });

      await tx.insert(notifications).values({
        organizationId: org.id,
        title: "Nueva cita agendada",
        body: `${data.customerName} — ${service.name} con ${barber.name} el ${data.date} a las ${data.time}`,
      });
    });
  } catch (err) {
    if (isExclusionViolation(err)) {
      return { error: "Ese horario ya está ocupado. Elige otra hora.", fieldErrors: { time: "Horario ocupado" } };
    }
    throw err;
  }

  revalidatePath("/agenda");
  revalidatePath(`/b/${data.slug}`);
  return { ok: true };
}
