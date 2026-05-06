import type { Metadata } from "next";
import { count } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

const MAX_FOUNDERS = 20;

export const metadata: Metadata = {
  title: "Precios — BarberLab",
  description:
    "Tres planes pensados para cada etapa de tu barbería. 14 días gratis, sin tarjeta, sin comisiones por cita.",
};

export default async function PreciosPage() {
  const [{ total }] = await db
    .select({ total: count() })
    .from(organizations);

  const remaining = Math.max(0, MAX_FOUNDERS - total);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 text-center sm:px-6 sm:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.45_0.15_25)]">
          Precios transparentes
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Elige el plan que se{" "}
          <span className="italic">acomoda a tu barbería</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[color:var(--muted-foreground)]">
          Todos los planes incluyen los 14 días gratis. Sin tarjeta al empezar.
        </p>
      </section>

      <PricingSection compact />
      <FaqSection />
      <CtaSection remaining={remaining} />
    </>
  );
}
