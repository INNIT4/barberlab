import { Clock, MessageCircle } from "lucide-react";
import type { Service } from "@/lib/db/schema";

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type ServiceLite = Pick<
  Service,
  "id" | "name" | "category" | "durationMinutes" | "priceMxn"
>;

const CATEGORY_ORDER = ["Corte", "Barba", "Combo", "Extras"] as const;

export function ServicesSection({
  services,
  whatsappUrl,
  accent,
}: {
  services: ServiceLite[];
  whatsappUrl: string | null;
  accent: string;
}) {
  if (services.length === 0) return null;

  const grouped = new Map<string, ServiceLite[]>();
  for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
  for (const s of services) {
    const list = grouped.get(s.category) ?? [];
    list.push(s);
    grouped.set(s.category, list);
  }

  return (
    <section id="servicios" className="border-t border-[oklch(0.25_0.02_60)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            Menú
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Servicios
          </h2>
        </header>

        <div className="space-y-12">
          {Array.from(grouped.entries()).map(([category, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-[oklch(0.7_0.04_60)]">
                  {category}
                </h3>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {list.map((s) => {
                    const serviceUrl = whatsappUrl
                      ? `${whatsappUrl.split("?")[0]}?text=${encodeURIComponent(`Hola, quisiera agendar ${s.name}`)}`
                      : null;
                    return (
                      <li
                        key={s.id}
                        className="group relative flex items-start justify-between gap-4 rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-5 transition-colors hover:border-[oklch(0.4_0.05_60)]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-lg font-semibold">
                            {s.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[oklch(0.75_0.03_60)]">
                            <Clock className="h-3 w-3" />
                            {s.durationMinutes} min
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-serif text-xl font-semibold" style={{ color: accent }}>
                            {fmt.format(s.priceMxn)}
                          </span>
                          {serviceUrl ? (
                            <a
                              href={serviceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.25_0.02_60)] px-3 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label={`Agendar ${s.name}`}
                            >
                              <MessageCircle className="h-3 w-3" />
                              Agendar
                            </a>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
