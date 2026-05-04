import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_BY_ID } from "@/lib/data/plans";
import { db } from "@/lib/db";
import { barbers, appointments } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { formatLimit, maxBarbersFor } from "@/lib/features/can";
import { OrganizationForm } from "./organization-form";
import { BrandingForm } from "./branding-form";
import { DangerZone } from "./danger-zone";

export const metadata: Metadata = {
  title: "Ajustes — BarberApp",
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function AjustesPage() {
  const { org } = await getCurrentOrg();

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
                <span className="font-mono">barberapp.mx/b/{org.slug}</span>
              </p>
            </div>

            <BrandingForm org={org} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
            <div className="border-b border-[color:var(--border)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Plan y facturación
                  </h2>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Actualmente estás en el plan{" "}
                    <span className="font-semibold text-[color:var(--foreground)]">
                      {plan.name}
                    </span>
                    .
                  </p>
                </div>
                <Badge className="bg-[oklch(0.96_0.02_25)] text-[oklch(0.45_0.15_25)] hover:bg-[oklch(0.96_0.02_25)]">
                  {plan.name}
                </Badge>
              </div>
            </div>

            <div className="bg-[oklch(0.985_0.008_80)] px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl font-semibold">
                    {fmt.format(plan.priceMxn)}
                    <span className="ml-1 text-sm font-normal text-[color:var(--muted-foreground)]">
                      MXN/mes
                    </span>
                  </p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {org.trialEndsAt
                      ? `Tu prueba termina el ${new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(org.trialEndsAt)}`
                      : "Suscripción activa"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/precios">Cambiar plan</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-[color:var(--border)] pt-5 sm:grid-cols-3">
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

          <DangerZone orgName={org.name} />
        </div>
      </div>
    </>
  );
}
