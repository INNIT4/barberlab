import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canViewCustomerHistory, canUseCustomerTags } from "@/lib/features/can";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { NewCustomerButton } from "./customer-form";
import { CustomerRowActions } from "./customer-row-actions";

export const metadata: Metadata = {
  title: "Clientes — BarberLab",
};

const TAG_STYLE: Record<string, string> = {
  VIP: "bg-[oklch(0.95_0.06_80)] text-[oklch(0.4_0.15_70)]",
  Regular: "bg-[oklch(0.96_0.02_240)] text-[oklch(0.4_0.1_240)]",
  Nuevo: "bg-[oklch(0.95_0.05_150)] text-[oklch(0.38_0.12_150)]",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ClientesPage() {
  const { org } = await getCurrentOrg();

  if (!canViewCustomerHistory(org.plan)) {
    return (
      <>
        <DashboardHeader title="Clientes" />
        <UpgradeBanner
          title="Historial de clientes"
          description="Consulta el directorio completo de tus clientes, su historial de citas y preferencias. Disponible en el plan Pro."
          requiredPlan="Pro"
        />
      </>
    );
  }

  const showTags = canUseCustomerTags(org.plan);

  const directory = await db
    .select()
    .from(customers)
    .where(eq(customers.organizationId, org.id))
    .orderBy(asc(customers.name));

  const total = directory.length;
  const vipCount = directory.filter((c) => c.tag === "VIP").length;
  const newCount = directory.filter((c) => c.tag === "Nuevo").length;
  const regularCount = directory.filter((c) => c.tag === "Regular").length;

  return (
    <>
      <DashboardHeader
        title="Clientes"
        subtitle="Tu base de clientes con historial y preferencias"
        action={<NewCustomerButton showTags={showTags} />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Total clientes
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">{total}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Clientes VIP
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {vipCount}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                alta frecuencia
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Regulares
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {regularCount}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                retorno habitual
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Nuevos
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {newCount}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                primera visita
              </p>
            </div>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
              <h2 className="font-serif text-lg font-semibold">
                Directorio de clientes
              </h2>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {total === 0
                  ? "Aún no tienes clientes registrados"
                  : `${total} clientes en total`}
              </p>
            </div>

            {total === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Al crear citas, los clientes aparecerán aquí automáticamente.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Notas</TableHead>
                    {showTags && <TableHead>Segmento</TableHead>}
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directory.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[oklch(0.95_0.03_60)] text-xs font-semibold text-[oklch(0.35_0.1_60)]">
                              {initials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            {c.email && (
                              <p className="text-[11px] text-[color:var(--muted-foreground)]">
                                {c.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {c.phone}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs text-[color:var(--muted-foreground)]">
                        {c.notes ?? "—"}
                      </TableCell>
                      {showTags && (
                        <TableCell>
                          {c.tag ? (
                            <Badge
                              variant="secondary"
                              className={TAG_STYLE[c.tag]}
                            >
                              {c.tag}
                            </Badge>
                          ) : (
                            <span className="text-xs text-[color:var(--muted-foreground)]">
                              —
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <CustomerRowActions customer={c} showTags={showTags} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
