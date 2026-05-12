import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { PLAN_BY_ID } from "@/lib/data/plans";
import { db } from "@/lib/db";
import { barbers, appointments } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { formatLimit, maxBarbersFor, canUseBranding } from "@/lib/features/can";
import { OrganizationForm } from "./organization-form";
import { BrandingForm } from "./branding-form";
import { BillingSection } from "./billing-section";
import { DangerZone } from "./danger-zone";
import { Lock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ajustes — BarberLab",
};


export default async function AjustesPage() {
  const { org } = await getCurrentOrg({ skipTrialRedirect: true });

  const [[{ barberCount }], [{ appointmentCount }]] = await Promise.all([
    db
      .select({ barberCount: count() })
      .from(barbers)
      .where(eq(barbers.organizationId, org.id)),
    db
      .select({ appointmentCount: count() })
      .from(appointments)
      .where(eq(appointments.organizationId, org.id)),
  ]);

  const plan = PLAN_BY_ID[org.plan];
  const barberLimit = maxBarbersFor(org.plan);
  const brandingAllowed = canUseBranding(org.plan);

  return (
    <>
      <DashboardHeader
        title="Ajustes"
        subtitle="Información de tu barbería, página pública y suscripción"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-6 lg:px-8">
          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-serif text-xl font-semibold">
                Información de la barbería
              </h2>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Lo que ven tus clientes en tu página pública.
              </p>
            </div>

            <OrganizationForm org={org} />
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-serif text-xl font-semibold">
                Página pública
              </h2>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Personaliza tu landing en{" "}
                <span className="font-mono">barberlab.app/b/{org.slug}</span>
              </p>
            </div>

            {brandingAllowed ? (
              <BrandingForm org={org} />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[color:var(--border)] bg-[oklch(0.985_0.005_80)] py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--muted)]">
                  <Lock className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Disponible en el plan Pro</p>
                  <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
                    Agrega logo, imagen hero, redes sociales y más.
                  </p>
                </div>
                <Link
                  href="/precios"
                  className="mt-1 text-xs font-semibold underline underline-offset-2"
                >
                  Ver planes →
                </Link>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
            <div className="border-b border-[color:var(--border)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Plan y estadísticas
                  </h2>
                </div>
                <Badge className="bg-[oklch(0.96_0.02_25)] text-[oklch(0.45_0.15_25)] hover:bg-[oklch(0.96_0.02_25)]">
                  {plan.name}
                </Badge>
              </div>
            </div>

            <div className="bg-[oklch(0.985_0.008_80)] px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    Barberos
                  </p>
                  <p className="mt-1 font-serif text-lg font-semibold">
                    {barberCount} / {formatLimit(barberLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    Citas totales
                  </p>
                  <p className="mt-1 font-serif text-lg font-semibold">
                    {appointmentCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    Zona horaria
                  </p>
                  <p className="mt-1 font-serif text-lg font-semibold">
                    {org.timezone}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <BillingSection
            plan={org.plan}
            stripeStatus={org.stripeStatus}
            stripeCurrentPeriodEnd={org.stripeCurrentPeriodEnd}
            hasStripe={!!org.stripeCustomerId}
          />

          <DangerZone orgName={org.name} />
        </div>
      </div>
    </>
  );
}
