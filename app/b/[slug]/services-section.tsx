"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Clock, Scissors } from "lucide-react";
import { BookingSheet, type SheetService, type SheetBarber } from "./booking-sheet";

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const CATEGORY_ORDER = ["Corte", "Barba", "Combo", "Extras"] as const;

export type CatalogService = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceMxn: number;
  imageUrl: string | null;
};

export function ServicesSection({
  slug,
  services,
  barbers,
  accent,
}: {
  slug: string;
  services: CatalogService[];
  barbers: SheetBarber[];
  accent: string;
}) {
  const [filter, setFilter] = useState<string>("Todo");
  const [openService, setOpenService] = useState<SheetService | null>(null);

  const categoriesPresent = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [services]);

  const filtered =
    filter === "Todo"
      ? services
      : services.filter((s) => s.category === filter);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogService[]>();
    for (const c of categoriesPresent) map.set(c, []);
    for (const s of filtered) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [filtered, categoriesPresent]);

  if (services.length === 0) return null;

  return (
    <section
      id="servicios"
      className="border-t border-[color:var(--ink)]/10 bg-[color:var(--paper)] py-16 text-[color:var(--ink)] sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <p
            className="stamp"
            style={{ color: accent }}
          >
            Menú de servicios
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Elige tu servicio y reserva en segundos
          </h2>
        </header>

        {/* Filtros por categoría */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(["Todo", ...categoriesPresent] as const).map((c) => {
            const active = c === filter;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-transparent text-[color:var(--paper)]"
                    : "border-[color:var(--ink)]/15 hover:border-[color:var(--ink)]/40"
                }`}
                style={active ? { background: accent } : undefined}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Grilla agrupada */}
        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([cat, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={cat}>
                <div className="mb-4 flex items-end justify-between border-b border-[color:var(--ink)]/15 pb-2">
                  <h3 className="font-serif text-xl font-semibold">{cat}</h3>
                  <span className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    {list.length} {list.length === 1 ? "servicio" : "servicios"}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      accent={accent}
                      onSelect={() => setOpenService(s)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BookingSheet
        slug={slug}
        service={openService}
        barbers={barbers}
        accent={accent}
        open={!!openService}
        onOpenChange={(v) => {
          if (!v) setOpenService(null);
        }}
      />
    </section>
  );
}

function ServiceCard({
  service,
  accent,
  onSelect,
}: {
  service: CatalogService;
  accent: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--ink)]/10 bg-[color:var(--card)] text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--ink)]/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-deep)]">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[color:var(--ink)]/20">
            <Scissors className="h-10 w-10" />
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--paper)]"
          style={{ background: accent }}
        >
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="font-serif text-lg font-semibold leading-snug">
          {service.name}
        </h4>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-foreground)]">
            <Clock className="h-3 w-3" />
            {service.durationMinutes} min
          </span>
          <span
            className="font-serif text-lg font-semibold"
            style={{ color: accent }}
          >
            {fmt.format(service.priceMxn)}
          </span>
        </div>
      </div>
    </button>
  );
}
