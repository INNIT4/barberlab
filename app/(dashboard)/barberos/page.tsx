import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Phone, Scissors } from "lucide-react";
import { db } from "@/lib/db";
import { barbers, barberServices, invitations, services } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canAddBarber, formatLimit, maxBarbersFor } from "@/lib/features/can";
import { PLAN_BY_ID } from "@/lib/data/plans";
import { summarizeWorkingHours, type WorkingHours } from "@/lib/data/working-hours";
import { NewBarberButton, NewBarberCard } from "./barber-form";
import { BarberRowActions } from "./barber-row-actions";
import { InviteStaffSection } from "./invite-staff";

export const metadata: Metadata = {
  title: "Barberos — BarberApp",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function BarberosPage() {
  const { org } = await getCurrentOrg();

  const [team, catalog, assignments, pendingInvites] = await Promise.all([
    db
      .select()
      .from(barbers)
      .where(eq(barbers.organizationId, org.id))
      .orderBy(asc(barbers.createdAt)),
    db
      .select({ id: services.id, name: services.name, category: services.category })
      .from(services)
      .where(eq(services.organizationId, org.id))
      .orderBy(asc(services.sortOrder)),
    db
      .select({ barberId: barberServices.barberId, serviceId: barberServices.serviceId })
      .from(barberServices)
      .innerJoin(barbers, eq(barberServices.barberId, barbers.id))
      .where(eq(barbers.organizationId, org.id)),
    db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, org.id),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date())
        )
      )
      .orderBy(asc(invitations.createdAt)),
  ]);

  const serviceByBarber = new Map<string, string[]>();
  for (const a of assignments) {
    const list = serviceByBarber.get(a.barberId) ?? [];
    list.push(a.serviceId);
    serviceByBarber.set(a.barberId, list);
  }

  const limit = maxBarbersFor(org.plan);
  const atLimit = !canAddBarber(org.plan, team.length);
  const planName = PLAN_BY_ID[org.plan].name;

  return (
    <>
      <DashboardHeader
        title="Barberos"
        subtitle="Gestiona tu equipo, horarios y servicios por barbero"
        action={<NewBarberButton disabled={atLimit} services={catalog} />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[oklch(0.98_0.02_25)] px-5 py-4">
            <div>
              <p className="text-sm font-medium">
                Plan {planName} · {team.length} de {formatLimit(limit)} barberos{" "}
                {limit === "unlimited" ? "" : "utilizados"}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {atLimit
                  ? "Alcanzaste el límite de tu plan. Actualiza para agregar más."
                  : "Puedes cambiar de plan cuando quieras desde ajustes."}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/precios">Ver planes</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.map((b) => (
              <article
                key={b.id}
                className="group relative flex flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <BarberRowActions
                  barber={b}
                  assignedServiceIds={serviceByBarber.get(b.id) ?? []}
                  services={catalog}
                />

                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback
                      className="font-serif text-lg font-semibold"
                      style={{
                        background: b.avatarTone,
                        color: "oklch(0.3 0.08 60)",
                      }}
                    >
                      {initials(b.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-semibold leading-tight">
                      {b.name}
                    </h3>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {b.role}
                    </p>
                  </div>
                </div>

                {b.phone ? (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                    <Phone className="h-3 w-3" />
                    <span>{b.phone}</span>
                  </div>
                ) : (
                  <div className="mt-4 text-xs italic text-[color:var(--muted-foreground)]">
                    Sin teléfono
                  </div>
                )}

                <div className="mt-2 flex items-start gap-2 text-xs text-[color:var(--muted-foreground)]">
                  <Clock className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {summarizeWorkingHours(b.workingHours as WorkingHours | null)}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-5">
                  <Badge
                    variant={b.active ? "secondary" : "outline"}
                    className={
                      b.active
                        ? "bg-[oklch(0.94_0.04_150)] text-[oklch(0.38_0.12_150)]"
                        : ""
                    }
                  >
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        b.active
                          ? "bg-[oklch(0.55_0.14_150)]"
                          : "bg-[color:var(--muted-foreground)]"
                      }`}
                    />
                    {b.active ? "Activo" : "Pausado"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                    <Link href="/agenda">
                      <Scissors className="h-3.5 w-3.5" />
                      Ver agenda
                    </Link>
                  </Button>
                </div>
              </article>
            ))}

            <NewBarberCard disabled={atLimit} services={catalog} />
          </div>

          {team.length === 0 ? (
            <p className="mt-6 text-center text-xs text-[color:var(--muted-foreground)]">
              Agrega a tu primer barbero para empezar a tomar citas.
            </p>
          ) : null}

          <InviteStaffSection
            invitations={pendingInvites.map((inv) => ({
              id: inv.id,
              email: inv.email,
              role: inv.role,
              expiresAt: inv.expiresAt.toISOString(),
              token: inv.token,
            }))}
          />
        </div>
      </div>
    </>
  );
}
