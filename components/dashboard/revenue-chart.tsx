const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export type DayRevenue = { day: string; revenue: number; isWeekend: boolean };

export function RevenueChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
            Ingresos de la semana
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold">
            {fmt.format(total)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-end gap-3">
        {data.map((d) => {
          const height = (d.revenue / max) * 100;
          return (
            <div
              key={d.day}
              className="group relative flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-40 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-[oklch(0.97_0.005_80)] transition-colors group-hover:bg-[oklch(0.94_0.008_80)]"
                  style={{ height: "100%" }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 rounded-t-md transition-all group-hover:brightness-95"
                  style={{
                    height: `${height}%`,
                    background: d.isWeekend
                      ? "linear-gradient(to top, oklch(0.5 0.18 25), oklch(0.65 0.17 25))"
                      : "linear-gradient(to top, oklch(0.3 0.05 60), oklch(0.4 0.04 60))",
                  }}
                />
                {d.revenue > 0 && (
                  <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-md bg-[color:var(--foreground)] px-2 py-1 text-[10px] font-semibold text-[color:var(--background)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {fmt.format(d.revenue)}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-[color:var(--muted-foreground)]">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
