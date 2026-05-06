"use server";

import { headers } from "next/headers";
import { and, eq, gte, lt, ne } from "drizzle-orm";
import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import {
  appointments,
  barbers,
  organizations,
  services,
} from "@/lib/db/schema";
import { computeAvailableSlots } from "@/lib/booking/slots";
import type { WorkingHours } from "@/lib/data/working-hours";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export type GetSlotsInput = {
  slug: string;
  serviceId: string;
  barberId: string;
  /** "YYYY-MM-DD" en TZ del negocio */
  date: string;
};

export type GetSlotsResult =
  | { ok: true; slots: string[] }
  | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function getAvailableSlotsAction(
  input: GetSlotsInput
): Promise<GetSlotsResult> {
  const headersList = await headers();
  const ip = getRateLimitKey(headersList, "slots");
  const { allowed } = await rateLimit(`slots:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) {
    return { ok: false, error: "Demasiadas consultas. Espera un minuto." };
  }

  if (!DATE_RE.test(input.date)) {
    return { ok: false, error: "Fecha inválida" };
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, input.slug),
  });
  if (!org) return { ok: false, error: "Barbería no encontrada" };

  const [service, barber] = await Promise.all([
    db.query.services.findFirst({
      where: and(
        eq(services.id, input.serviceId),
        eq(services.organizationId, org.id),
        eq(services.active, true)
      ),
    }),
    db.query.barbers.findFirst({
      where: and(
        eq(barbers.id, input.barberId),
        eq(barbers.organizationId, org.id),
        eq(barbers.active, true)
      ),
    }),
  ]);

  if (!service) return { ok: false, error: "Servicio no encontrado" };
  if (!barber) return { ok: false, error: "Barbero no encontrado" };

  const tz = org.timezone;
  const dayStartUtc = fromZonedTime(`${input.date} 00:00:00`, tz);
  const nextDayUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60_000);

  const existing = await db
    .select({
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.barberId, barber.id),
        gte(appointments.startsAt, dayStartUtc),
        lt(appointments.startsAt, nextDayUtc),
        ne(appointments.status, "cancelada")
      )
    );

  const [year, month, day] = input.date.split("-").map(Number);

  const slots = computeAvailableSlots({
    dateLocal: { year, month, day },
    workingHours: barber.workingHours as WorkingHours | null,
    serviceDurationMin: service.durationMinutes,
    toUtc: (local) => fromZonedTime(local, tz),
    existing,
    now: new Date(),
  });

  return { ok: true, slots: slots.map((s) => s.time) };
}
