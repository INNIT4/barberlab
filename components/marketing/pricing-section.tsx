import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/data/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrialPayButton } from "@/app/(marketing)/precios/trial-pay-button";

import { mxnCurrency } from "@/lib/formatters";

export function PricingSection({
  compact = false,
  trialExpired = false,
}: {
  compact?: boolean;
  trialExpired?: boolean;
}) {
  return (
    <section
      id="precios"
      className={cn(
        "relative mx-auto max-w-6xl px-4 sm:px-6",
        compact ? "py-12" : "py-24 lg:py-32"
      )}
    >
      {!compact && (
        <div className="mx-auto max-w-3xl text-center">
          <p className="stamp text-[color:var(--oxblood)]">
            §4 · Precios en pesos · Sin letra chiquita
          </p>
          <h2 className="mt-4 font-display text-[2.6rem] leading-[0.95] tracking-tight text-[color:var(--ink)] ink-press sm:text-[3.6rem] lg:text-[4.2rem]">
            Un plan para cada
            <br />
            <span className="italic text-[color:var(--oxblood)]">
              etapa
            </span>{" "}
            de tu barbería.
          </h2>
          <p className="mt-5 font-serif text-lg text-[color:var(--foreground)]/80">
            Prueba 1 mes gratis, sin tarjeta. Cancelas cuando quieras —
            <span className="italic"> sin letra chiquita.</span>
          </p>
        </div>
      )}

      <div
        className={cn(
          "grid gap-6 lg:grid-cols-3 lg:gap-7",
          compact ? "mt-0" : "mt-16"
        )}
      >
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col bg-[color:var(--paper)] transition-transform",
              plan.highlighted
                ? "border-2 border-[color:var(--ink)] shadow-[8px_10px_0_var(--oxblood)] lg:-translate-y-3"
                : "border border-[color:var(--ink)]/30 shadow-[4px_5px_0_oklch(0.18_0.02_50/0.18)] hover:-translate-y-1"
            )}
          >
            {/* Perforated top edge */}
            <div
              aria-hidden
              className="h-3 [background-image:radial-gradient(circle_at_6px_50%,var(--background)_3px,transparent_4px)] [background-size:12px_12px]"
            />

            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 border border-[color:var(--ink)] bg-[color:var(--oxblood)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--paper)] shadow-[2px_2px_0_var(--ink)]">
                {plan.badge}
              </span>
            )}

            <header className="flex-none px-7 pt-6 pb-5">
              <p className="stamp-tight text-[color:var(--muted-foreground)]">
                Plan {plan.id}
              </p>
              <h3 className="mt-2 font-display text-[2rem] leading-none text-[color:var(--ink)]">
                {plan.name}
              </h3>
              <p className="mt-2 font-serif text-sm italic text-[color:var(--muted-foreground)]">
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5 border-y border-dashed border-[color:var(--ink)]/30 py-4">
                <span className="font-display text-[3.2rem] leading-none tracking-tight text-[color:var(--ink)]">
                  {mxnCurrency.format(plan.priceMxn)}
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  MXN /mes
                </span>
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                IVA incluido · Facturación al día 1
              </p>
            </header>

            <ul className="flex-1 space-y-2.5 px-7">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 font-serif text-[14px] text-[color:var(--ink)]/85"
                >
                  <Check
                    className="mt-1 h-3.5 w-3.5 flex-none text-[color:var(--oxblood)]"
                    strokeWidth={2.5}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="px-7 pb-7 pt-7">
              {trialExpired ? (
                <TrialPayButton
                  plan={plan.id}
                  label={`Elegir ${plan.name}`}
                />
              ) : (
                <Button
                  asChild
                  className={cn(
                    "h-11 w-full text-[0.78rem] uppercase tracking-[0.2em] shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]",
                    plan.highlighted
                      ? "bg-[color:var(--oxblood)] text-[color:var(--paper)] hover:bg-[color:var(--ink)]"
                      : "border border-[color:var(--ink)] bg-transparent text-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                  )}
                >
                  <Link href={`/signup?plan=${plan.id}`}>
                    {plan.highlighted ? "Empezar prueba" : "Elegir plan"}
                  </Link>
                </Button>
              )}
            </div>

            {/* Perforated bottom edge */}
            <div
              aria-hidden
              className="h-3 [background-image:radial-gradient(circle_at_6px_50%,var(--background)_3px,transparent_4px)] [background-size:12px_12px]"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
