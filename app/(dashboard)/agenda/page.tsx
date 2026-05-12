import type { Metadata } from "next";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfWeek, addDays } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { db } from "@/lib/db";
import { appointments, barbers, services, customers, barberServices, walkIns } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { NewAppointmentButton } from "./new-appointment-dialog";
import { AgendaShell } from "./agenda-shell";

export const metadata: Metadata = {
  title: "Agenda — BarberLab",
};

import { mxnCurrency } from "@/lib/formatters";
import type { WorkingHours } from "@/lib/data/working-hours";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string; view?: string }>;
}) {
  const { org } = await getCurrentOrg();
  const tz = org.timezone;
  const params = await searchParams;

  const todayLocal = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

  const weekStartLocal =
    params.week ??
    formatInTimeZone(
      startOfWeek(toZonedTime(new Date(), tz), { weekStartsOn: 1 }),
      tz,
      "yyyy-MM-dd"
    );

  const dayLocal = params.day ?? todayLocal;

  const weekStart = fromZonedTime(`${weekStartLocal} 00:00:00`, tz);
  const weekEnd = addDays(weekStart, 7);

  const [team, catalog, directory, assignments] = await Promise.all([
    db
      .select({
        id: barbers.id,
        name: barbers.name,
        avatarTone: barbers.avatarTone,
        workingHours: barbers.workingHours,
      })
      .from(barbers)
      .where(and(eq(barbers.organizationId, org.id), eq(barbers.active, true)))
      .orderBy(asc(barbers.name)),
    db
      .select({
        id: services.id,
        name: services.name,
        durationMinutes: services.durationMinutes,
        priceMxn: services.priceMxn,
      })
      .from(services)
      .where(and(eq(services.organizationId, org.id), eq(services.active, true)))
      .orderBy(asc(services.sortOrder), asc(services.name)),
    db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
      })
      .from(customers)
      .where(eq(customers.organizationId, org.id))
      .orderBy(asc(customers.name)),
    db
      .select({
        barberId: barberServices.barberId,
        serviceId: barberServices.serviceId,
      })
      .from(barberServices)
      .innerJoin(barbers, eq(barberServices.barberId, barbers.id))
      .where(eq(barbers.organizationId, org.id)),
  ]);

  const serviceIdsByBarber: Record<string, string[]> = {};
  for (const a of assignments) {
    const list = serviceIdsByBarber[a.barberId] ?? [];
    list.push(a.serviceId);
    serviceIdsByBarber[a.barberId] = list;
  }

  const weekAppointments = await db
    .select({
      id: appointments.id,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      status: appointments.status,
      priceMxn: appointments.priceMxn,
      barberId: appointments.barberId,
      barberName: barbers.name,
      barberTone: barbers.avatarTone,
      serviceName: services.name,
      serviceDuration: services.durationMinutes,
      customerName: customers.name,
      customerPhone: customers.phone,
      notes: appointments.notes,
    })
    .from(appointments)
    .leftJoin(barbers, eq(appointments.barberId, barbers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .where(
      and(
        eq(appointments.organizationId, org.id),
        gte(appointments.startsAt, weekStart),
        lt(appointments.startsAt, weekEnd)
      )
    )
    .orderBy(asc(appointments.startsAt));

  const weekWalkIns = await db
    .select({
      priceMxn: walkIns.priceMxn,
    })
    .from(walkIns)
    .where(
      and(
        eq(walkIns.organizationId, org.id),
        gte(walkIns.date, weekStart),
        lt(walkIns.date, weekEnd)
      )
    );

  const walkInRevenue = weekWalkIns.reduce((sum, w) => sum + w.priceMxn, 0);
  const walkInCount = weekWalkIns.length;

  const confirmedRevenue =
    weekAppointments
      .filter((a) => a.status === "completada" || a.status === "confirmada")
      .reduce((sum, a) => sum + a.priceMxn, 0) + walkInRevenue;

  const activeCount =
    weekAppointments.filter((a) => a.status !== "cancelada").length + walkInCount;
  const totalMinutes = weekAppointments
    .filter((a) => a.status !== "cancelada")
    .reduce((s, a) => s + (a.serviceDuration ?? 0), 0);

  const appointmentSlots = weekAppointments.map((a) => ({
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    endsAt: a.endsAt.toISOString(),
    status: a.status,
    priceMxn: a.priceMxn,
    barberName: a.barberName ?? "",
    barberTone: a.barberTone ?? "oklch(0.55 0.14 80)",
    serviceName: a.serviceName ?? "",
    serviceDuration: a.serviceDuration ?? 0,
    customerName: a.customerName ?? "(cliente eliminado)",
    customerPhone: a.customerPhone ?? "",
    notes: a.notes ?? undefined,
  }));

  const weekLabel = formatInTimeZone(weekStart, tz, "EEEE d 'de' MMMM");

  const workingBarbers = team.map((b) => ({
    id: b.id,
    name: b.name,
    avatarTone: b.avatarTone,
    workingHours: b.workingHours as WorkingHours | null,
  }));

  return (
    <AgendaShell
      appointments={appointmentSlots}
      today={todayLocal}
      currentWeekStart={weekStartLocal}
      currentDay={dayLocal}
      timezone={tz}
      barbers={team.map((b) => ({
        id: b.id,
        name: b.name,
        avatarTone: b.avatarTone,
      }))}
      workingBarbers={workingBarbers}
      serviceIdsByBarber={serviceIdsByBarber}
    >
      <DashboardHeader
        title="Agenda"
        subtitle={`${capitalize(weekLabel)} · ${org.name}`}
        action={
          <NewAppointmentButton
            barbers={team.map((b) => ({ id: b.id, name: b.name }))}
            services={catalog}
            customers={directory}
            defaultDate={todayLocal}
            serviceIdsByBarber={serviceIdsByBarber}
          />
        }
      />

      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Citas de la semana"
            value={String(activeCount)}
            hint={`${team.length} barberos activos · inc. walk-ins`}
          />
          <StatCard
            label="Ingresos de la semana"
            value={mxnCurrency.format(confirmedRevenue)}
            tone="positive"
            hint="confirmadas + completadas"
          />
          <StatCard
            label="Clientes"
            value={String(
              new Set(
                weekAppointments
                  .filter((a) => a.status !== "cancelada")
                  .map((a) => a.customerName ?? "")
              ).size
            )}
            hint="distintos en la semana"
          />
          <StatCard
            label="Horas reservadas"
            value={`${Math.round(totalMinutes / 60)}h`}
            hint="ocupación semanal"
          />
        </div>
      </div>
    </AgendaShell>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
