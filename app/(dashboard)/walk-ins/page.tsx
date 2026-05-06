import type { Metadata } from "next";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { db } from "@/lib/db";
import {
  walkIns,
  barbers,
  services,
  barberServices,
} from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { WalkInForm } from "./walk-in-form";
import { WalkInList, type WalkInRow } from "./walk-in-list";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export const metadata: Metadata = {
  title: "Walk-ins — BarberLab",
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function WalkInsPage() {
  const { org } = await getCurrentOrg();
  const tz = org.timezone;

  const todayLocal = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

  const now = new Date();
  const zonedNow = toZonedTime(now, tz);
  const year = zonedNow.getFullYear();
  const month = zonedNow.getMonth();
  const monthStart = fromZonedTime(new Date(year, month, 1), tz);
  const nextMonthStart = fromZonedTime(new Date(year, month + 1, 1), tz);

  const [team, catalog, assignments] = await Promise.all([
    db
      .select({ id: barbers.id, name: barbers.name, avatarTone: barbers.avatarTone })
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

  const monthWalkIns = await db
    .select({
      id: walkIns.id,
      priceMxn: walkIns.priceMxn,
      date: walkIns.date,
      notes: walkIns.notes,
      barberName: barbers.name,
      serviceName: services.name,
    })
    .from(walkIns)
    .leftJoin(barbers, eq(walkIns.barberId, barbers.id))
    .leftJoin(services, eq(walkIns.serviceId, services.id))
    .where(
      and(
        eq(walkIns.organizationId, org.id),
        gte(walkIns.date, monthStart),
        lt(walkIns.date, nextMonthStart)
      )
    )
    .orderBy(desc(walkIns.date));

  const monthRevenue = monthWalkIns.reduce((s, w) => s + w.priceMxn, 0);
  const todayRevenue = monthWalkIns
    .filter((w) => {
      const local = formatInTimeZone(w.date, tz, "yyyy-MM-dd");
      return local === todayLocal;
    })
    .reduce((s, w) => s + w.priceMxn, 0);

  const rows: WalkInRow[] = monthWalkIns.map((w) => ({
    id: w.id,
    priceMxn: w.priceMxn,
    date: w.date.toISOString(),
    notes: w.notes,
    barberName: w.barberName,
    serviceName: w.serviceName,
  }));

  const monthLabel = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(now);

  return (
    <>
      <DashboardHeader
        title="Walk-ins"
        subtitle={`${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} · ${org.name}`}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Ventas del mes"
              value={fmt.format(monthRevenue)}
              tone="positive"
              hint={`${monthWalkIns.length} walk-ins`}
            />
            <StatCard
              label="Ventas hoy"
              value={fmt.format(todayRevenue)}
              hint="walk-ins del día"
            />
            <StatCard
              label="Ticket promedio"
              value={
                monthWalkIns.length > 0
                  ? fmt.format(Math.round(monthRevenue / monthWalkIns.length))
                  : "$0"
              }
              hint="por walk-in este mes"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold">
                Nueva venta rápida
              </h2>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                Llegó alguien sin cita? Regístralo aquí.
              </p>
              <div className="mt-4">
                <WalkInForm
                  barbers={team}
                  services={catalog}
                  serviceIdsByBarber={serviceIdsByBarber}
                  defaultDate={todayLocal}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="font-serif text-lg font-semibold">
                  Historial del mes
                </h2>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Walk-ins registrados
                </p>
              </div>
              <WalkInList walkIns={rows} timezone={tz} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
