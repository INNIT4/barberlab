import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function PricingSection({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id="precios"
      className={cn(
        "mx-auto max-w-6xl px-4 sm:px-6",
        compact ? "py-12" : "py-20 lg:py-28"
      )}
    >
      {!compact && (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.45_0.15_25)]">
            Precios claros, en pesos
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Un plan para cada etapa de tu barbería.
          </h2>
          <p className="mt-4 text-lg text-[color:var(--muted-foreground)]">
            Prueba 14 días gratis, sin tarjeta. Cancelas cuando quieras, sin
            letra chiquita.
          </p>
        </div>
      )}

      <div
        className={cn(
          "grid gap-6 lg:grid-cols-3",
          compact ? "mt-0" : "mt-14"
        )}
      >
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-[color:var(--card)] p-7 transition-shadow",
              plan.highlighted
                ? "border-[oklch(0.55_0.18_25)] shadow-[0_20px_50px_-20px_oklch(0.55_0.18_25_/_0.35)] lg:-translate-y-2"
                : "border-[color:var(--border)] hover:shadow-lg"
            )}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-6 rounded-full bg-[oklch(0.55_0.18_25)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                {plan.badge}
              </span>
            )}
            <header className="flex-none">
              <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                {plan.tagline}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-5xl font-semibold tracking-tight">
                  {priceFormatter.format(plan.priceMxn)}
                </span>
                <span className="text-sm text-[color:var(--muted-foreground)]">
                  MXN /mes
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
                IVA incluido · Facturación al día 1
              </p>
            </header>

            <ul className="mt-6 flex-1 space-y-3 border-t border-[color:var(--border)] pt-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[oklch(0.55_0.14_150)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              variant={plan.highlighted ? "default" : "outline"}
              className="mt-8 h-11"
            >
              <Link href={`/signup?plan=${plan.id}`}>
                {plan.highlighted ? "Empezar prueba gratuita" : "Elegir plan"}
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
