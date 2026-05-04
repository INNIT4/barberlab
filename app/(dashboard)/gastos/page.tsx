import type { Metadata } from "next";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { NewExpenseButton, EditExpenseButton } from "./expense-form";
import { deleteExpenseAction } from "./actions";

export const metadata: Metadata = {
  title: "Gastos — BarberApp",
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const CATEGORY_LABEL: Record<string, string> = {
  Productos: "Productos",
  Alquiler: "Alquiler",
  Servicios: "Servicios",
  Salarios: "Salarios",
  Marketing: "Marketing",
  Otro: "Otro",
};

const CATEGORY_BG: Record<string, string> = {
  Productos: "bg-[oklch(0.94_0.04_240)] text-[oklch(0.38_0.12_240)]",
  Alquiler: "bg-[oklch(0.94_0.06_80)] text-[oklch(0.42_0.14_70)]",
  Servicios: "bg-[oklch(0.94_0.04_150)] text-[oklch(0.38_0.12_150)]",
  Salarios: "bg-[oklch(0.94_0.04_300)] text-[oklch(0.38_0.12_300)]",
  Marketing: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.4_0.15_25)]",
  Otro: "bg-[oklch(0.94_0.02_260)] text-[oklch(0.38_0.1_260)]",
};

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { org } = await getCurrentOrg();
  const tz = org.timezone;
  const params = await searchParams;

  const now = new Date();
  const monthStr = params?.month ?? formatInTimeZone(now, tz, "yyyy-MM");

  const year = parseInt(monthStr.split("-")[0]);
  const month = parseInt(monthStr.split("-")[1]) - 1;
  const monthStartTz = new Date(year, month, 1);
  const nextMonthTz = new Date(year, month + 1, 1);

  const monthStart = fromZonedTime(monthStartTz, tz);
  const nextMonthStart = fromZonedTime(nextMonthTz, tz);

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const list = await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.organizationId, org.id),
        gte(expenses.date, monthStart),
        lt(expenses.date, nextMonthStart)
      )
    )
    .orderBy(desc(expenses.date), desc(expenses.createdAt));

  const totalMonth = list.reduce((s, e) => s + e.amountMxn, 0);

  const byCategory: Record<string, number> = {};
  for (const e of list) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amountMxn;
  }

  const topCategory = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a
  )[0];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const avgDaily = Math.round(totalMonth / Math.max(1, daysInMonth));

  const monthLabel = formatInTimeZone(monthStart, tz, "MMMM yyyy");
  const prevLabel = formatInTimeZone(
    fromZonedTime(prevMonth, tz),
    tz,
    "yyyy-MM"
  );
  const nextLabel = formatInTimeZone(
    fromZonedTime(nextMonth, tz),
    tz,
    "yyyy-MM"
  );

  return (
    <>
      <DashboardHeader
        title="Gastos"
        subtitle={`${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} · ${org.name}`}
        action={<NewExpenseButton />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Gastos del mes"
              value={fmt.format(totalMonth)}
              tone="negative"
              hint={`${list.length} movimientos`}
            />
            <StatCard
              label="Promedio diario"
              value={fmt.format(avgDaily)}
              hint={`${daysInMonth} días`}
            />
            <StatCard
              label="Top categoría"
              value={topCategory ? CATEGORY_LABEL[topCategory[0]] ?? topCategory[0] : "—"}
              hint={topCategory ? fmt.format(topCategory[1]) : "Sin gastos"}
            />
            <StatCard
              label="Mayor gasto"
              value={list.length > 0 ? fmt.format(Math.max(...list.map((e) => e.amountMxn))) : "—"}
              hint={list.length > 0 ? list.reduce((a, b) => (a.amountMxn > b.amountMxn ? a : b)).description : "Sin gastos"}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/gastos?month=${prevLabel}`}>← Mes anterior</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/gastos?month=${nextLabel}`}>
                  Mes siguiente →
                </a>
              </Button>
            </div>
          </div>

          {Object.keys(byCategory).length > 0 && (
            <div className="mt-4 space-y-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = Math.round((amount / totalMonth) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-3 text-sm">
                      <span className="w-24 truncate text-xs text-[color:var(--muted-foreground)]">
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                      <div className="flex-1 rounded-full bg-[color:var(--border)]">
                        <div
                          className="h-2 rounded-full bg-[oklch(0.45_0.15_25)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs tabular-nums">
                        {fmt.format(amount)} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
            <header className="border-b border-[color:var(--border)] px-5 py-4">
              <h2 className="font-serif text-lg font-semibold">Movimientos</h2>
            </header>

            {list.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  No hay gastos registrados este mes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[color:var(--border)] text-left text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Descripción</th>
                      <th className="px-5 py-3">Categoría</th>
                      <th className="px-5 py-3 text-right">Monto</th>
                      <th className="px-5 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e) => {
                      const dateLabel = formatInTimeZone(e.date, tz, "d MMM");
                      return (
                        <tr
                          key={e.id}
                          className="border-b border-[color:var(--border)] text-sm transition-colors hover:bg-[oklch(0.98_0.005_80)]"
                        >
                          <td className="px-5 py-3 whitespace-nowrap text-xs">
                            {dateLabel}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-medium">{e.description}</p>
                            {e.notes && (
                              <p className="text-[10px] text-[color:var(--muted-foreground)]">
                                {e.notes}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                CATEGORY_BG[e.category] ?? CATEGORY_BG.Otro
                              }`}
                            >
                              {CATEGORY_LABEL[e.category] ?? e.category}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold">
                            {fmt.format(e.amountMxn)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <EditExpenseButton
                                expense={{
                                  id: e.id,
                                  description: e.description,
                                  amountMxn: e.amountMxn,
                                  category: e.category,
                                  notes: e.notes,
                                  date: formatInTimeZone(e.date, tz, "yyyy-MM-dd"),
                                }}
                              />
                              <form
                                action={async () => {
                                  "use server";
                                  await deleteExpenseAction(e.id);
                                }}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[oklch(0.4_0.15_25)]"
                                  type="submit"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
