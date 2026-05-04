import type { Metadata } from "next";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart, type DayRevenue } from "@/components/dashboard/revenue-chart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { db } from "@/lib/db";
import { appointments, barbers, services, expenses } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { ExportPdfButton } from "./export-button";

export const metadata: Metadata = {
  title: "Reportes — BarberApp",
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKEND = new Set([0, 6]);

export default async function ReportesPage() {
  const { org } = await getCurrentOrg();
  const tz = org.timezone;

  const now = new Date();
  const zonedNow = toZonedTime(now, tz);
  const year = zonedNow.getFullYear();
  const month = zonedNow.getMonth();

  const monthStart = fromZonedTime(new Date(year, month, 1), tz);
  const nextMonthStart = fromZonedTime(new Date(year, month + 1, 1), tz);
  const prevMonthStart = fromZonedTime(new Date(year, month - 1, 1), tz);

  // Start of current week (Sunday)
  const dayOfWeek = zonedNow.getDay();
  const weekStart = fromZonedTime(
    new Date(year, month, zonedNow.getDate() - dayOfWeek),
    tz
  );
  const nextWeekStart = fromZonedTime(
    new Date(year, month, zonedNow.getDate() - dayOfWeek + 7),
    tz
  );

  const orgFilter = eq(appointments.organizationId, org.id);
  const completada = sql`${appointments.status} = 'completada'`;

  const [
    [monthStats],
    [prevStats],
    barbersPerf,
    topSvcs,
    weekRows,
    [expenseTotal],
  ] = await Promise.all([
    // Current month aggregates
    db
      .select({
        revenue: sql<number>`coalesce(sum(case when ${completada} then ${appointments.priceMxn} else 0 end), 0)`,
        completed: sql<number>`count(case when ${completada} then 1 end)::int`,
        cancelled: sql<number>`count(case when ${appointments.status} = 'cancelada' then 1 end)::int`,
        total: sql<number>`count(*)::int`,
        avgTicket: sql<number>`coalesce(avg(case when ${completada} then ${appointments.priceMxn} end), 0)`,
      })
      .from(appointments)
      .where(and(orgFilter, gte(appointments.startsAt, monthStart), lt(appointments.startsAt, nextMonthStart))),

    // Previous month revenue
    db
      .select({
        revenue: sql<number>`coalesce(sum(case when ${completada} then ${appointments.priceMxn} else 0 end), 0)`,
      })
      .from(appointments)
      .where(and(orgFilter, gte(appointments.startsAt, prevMonthStart), lt(appointments.startsAt, monthStart))),

    // Barbers performance this month
    db
      .select({
        name: barbers.name,
        avatarTone: barbers.avatarTone,
        revenue: sql<number>`coalesce(sum(case when ${completada} then ${appointments.priceMxn} else 0 end), 0)`,
        bookings: sql<number>`count(case when ${completada} then 1 end)::int`,
      })
      .from(appointments)
      .innerJoin(barbers, eq(appointments.barberId, barbers.id))
      .where(and(orgFilter, gte(appointments.startsAt, monthStart), lt(appointments.startsAt, nextMonthStart)))
      .groupBy(barbers.id, barbers.name, barbers.avatarTone)
      .orderBy(desc(sql`coalesce(sum(case when ${appointments.status} = 'completada' then ${appointments.priceMxn} else 0 end), 0)`)),

    // Top 5 services this month
    db
      .select({
        name: services.name,
        revenue: sql<number>`coalesce(sum(case when ${completada} then ${appointments.priceMxn} else 0 end), 0)`,
        bookings: sql<number>`count(case when ${completada} then 1 end)::int`,
        unitPrice: services.priceMxn,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(orgFilter, gte(appointments.startsAt, monthStart), lt(appointments.startsAt, nextMonthStart)))
      .groupBy(services.id, services.name, services.priceMxn)
      .orderBy(desc(sql`coalesce(sum(case when ${appointments.status} = 'completada' then ${appointments.priceMxn} else 0 end), 0)`))
      .limit(5),

    // Revenue by day of week this week
    db
      .select({
        dayOfWeek: sql<number>`extract(dow from ${appointments.startsAt} at time zone ${tz})::int`,
        revenue: sql<number>`coalesce(sum(case when ${completada} then ${appointments.priceMxn} else 0 end), 0)`,
      })
      .from(appointments)
      .where(and(orgFilter, gte(appointments.startsAt, weekStart), lt(appointments.startsAt, nextWeekStart)))
      .groupBy(sql`1`),

    // Total expenses this month
    db
      .select({
        total: sql<number>`coalesce(sum(${expenses.amountMxn}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.organizationId, org.id),
          gte(expenses.date, monthStart),
          lt(expenses.date, nextMonthStart)
        )
      ),
  ]);

  const revenueMap = new Map(weekRows.map((r) => [r.dayOfWeek, r.revenue]));
  const weekData: DayRevenue[] = DAY_LABELS.map((day, i) => ({
    day,
    revenue: revenueMap.get(i) ?? 0,
    isWeekend: WEEKEND.has(i),
  }));

  const growth =
    prevStats.revenue > 0
      ? (((monthStats.revenue - prevStats.revenue) / prevStats.revenue) * 100).toFixed(1)
      : null;

  const cancelRate =
    monthStats.total > 0
      ? ((monthStats.cancelled / monthStats.total) * 100).toFixed(1)
      : "0.0";

  const maxBarberRevenue = Math.max(...barbersPerf.map((b) => b.revenue), 1);

  const netProfit = monthStats.revenue - expenseTotal.total;

  const monthLabel = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(now);

  return (
    <>
      <DashboardHeader
        title="Reportes"
        subtitle={`${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} · ${org.name}`}
        action={<ExportPdfButton />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Ingresos del mes"
              value={fmt.format(monthStats.revenue)}
              delta={
                growth
                  ? {
                      value: `${Number(growth) >= 0 ? "+" : ""}${growth}%`,
                      direction: Number(growth) >= 0 ? "up" : "down",
                    }
                  : undefined
              }
              tone={growth && Number(growth) >= 0 ? "positive" : undefined}
              hint="vs. mes anterior"
            />
            <StatCard
              label="Gastos del mes"
              value={fmt.format(expenseTotal.total)}
              tone="negative"
              hint="total egresos"
            />
            <StatCard
              label="Ganancia neta"
              value={fmt.format(netProfit)}
              tone={netProfit >= 0 ? "positive" : "negative"}
              hint="ingresos – gastos"
            />
            <StatCard
              label="Citas completadas"
              value={String(monthStats.completed)}
              hint="este mes"
            />
            <StatCard
              label="Ticket promedio"
              value={fmt.format(Math.round(monthStats.avgTicket))}
              hint="citas completadas"
            />
            <StatCard
              label="Tasa de cancelación"
              value={`${cancelRate}%`}
              tone={Number(cancelRate) > 10 ? "negative" : "positive"}
              hint="menor = mejor"
            />
          </div>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <RevenueChart data={weekData} />
            </div>

            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Retención de clientes
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-semibold">—</span>
              </div>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                Disponible cuando acumules historial de citas
              </p>
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="font-serif text-lg font-semibold">
                  Rendimiento por barbero
                </h2>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Este mes · citas completadas
                </p>
              </div>
              {barbersPerf.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[color:var(--muted-foreground)]">
                  Sin datos este mes.
                </p>
              ) : (
                <ul className="divide-y divide-[color:var(--border)]">
                  {barbersPerf.map((b) => {
                    const pct = Math.round((b.revenue / maxBarberRevenue) * 100);
                    return (
                      <li key={b.name} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{b.name}</p>
                            <p className="text-xs text-[color:var(--muted-foreground)]">
                              {b.bookings} citas · {fmt.format(b.revenue)}
                            </p>
                          </div>
                          <span className="font-serif text-lg font-semibold">
                            {pct}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[oklch(0.97_0.005_80)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct >= 90
                                  ? "oklch(0.55 0.14 150)"
                                  : pct >= 70
                                  ? "oklch(0.55 0.14 80)"
                                  : "oklch(0.55 0.18 25)",
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <div className="border-b border-[color:var(--border)] px-6 py-4">
                <h2 className="font-serif text-lg font-semibold">
                  Top 5 servicios
                </h2>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Por ingresos este mes
                </p>
              </div>
              {topSvcs.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[color:var(--muted-foreground)]">
                  Sin datos este mes.
                </p>
              ) : (
                <ul className="divide-y divide-[color:var(--border)]">
                  {topSvcs.map((s, i) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl font-semibold text-[color:var(--muted-foreground)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-[color:var(--muted-foreground)]">
                            {s.bookings} citas · {fmt.format(s.unitPrice)} c/u
                          </p>
                        </div>
                      </div>
                      <span className="font-serif text-base font-semibold">
                        {fmt.format(s.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
