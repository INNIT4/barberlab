import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations, memberships } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TrialExpiredBanner } from "./trial-expired-banner";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

const MAX_FOUNDERS = 20;

export const metadata: Metadata = {
  title: "Precios — BarberLab",
  description:
    "Tres planes pensados para cada etapa de tu barbería. 1 mes gratis, sin tarjeta, sin comisiones por cita.",
};

export default async function PreciosPage() {
  const [{ total }] = await db
    .select({ total: count() })
    .from(organizations);

  const remaining = Math.max(0, MAX_FOUNDERS - total);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let trialExpired = false;
  let isOwnerRole = false;

  if (user) {
    const membership = await db.query.memberships.findFirst({
      where: eq(memberships.userId, user.id),
      with: { organization: { columns: { trialEndsAt: true, stripeSubscriptionId: true } } },
      columns: { role: true },
    });
    if (membership) {
      isOwnerRole = membership.role === "owner";
      if (
        membership.organization.trialEndsAt &&
        membership.organization.trialEndsAt < new Date() &&
        !membership.organization.stripeSubscriptionId
      ) {
        trialExpired = true;
      }
    }
  }

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
          Todos los planes incluyen 1 mes gratis. Sin tarjeta al empezar.
        </p>
      </section>

      {trialExpired && <TrialExpiredBanner isOwner={isOwnerRole} />}
      <PricingSection compact trialExpired={trialExpired && isOwnerRole} />
      <FaqSection />
      <CtaSection remaining={remaining} />
    </>
  );
}
