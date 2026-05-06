import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { NewServiceButton } from "./service-form";
import { ServiceRowActions } from "./service-row-actions";

export const metadata: Metadata = {
  title: "Servicios — BarberLab",
};

const CATEGORY_STYLE: Record<string, string> = {
  Corte: "bg-[oklch(0.96_0.03_25)] text-[oklch(0.45_0.15_25)]",
  Barba: "bg-[oklch(0.96_0.03_60)] text-[oklch(0.4_0.12_60)]",
  Combo: "bg-[oklch(0.95_0.04_150)] text-[oklch(0.38_0.12_150)]",
  Extras: "bg-[oklch(0.96_0.02_240)] text-[oklch(0.4_0.1_240)]",
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default async function ServiciosPage() {
  const { org } = await getCurrentOrg();

  const catalog = await db
    .select()
    .from(services)
    .where(eq(services.organizationId, org.id))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));

  const active = catalog.filter((s) => s.active);
  const inactive = catalog.filter((s) => !s.active);
  const avgPrice = active.length
    ? active.reduce((s, x) => s + x.priceMxn, 0) / active.length
    : 0;
  const avgDuration = active.length
    ? active.reduce((s, x) => s + x.durationMinutes, 0) / active.length
    : 0;

  return (
    <>
      <DashboardHeader
        title="Servicios"
        subtitle="Lo que ofrecen tus barberos. Ajusta precios y tiempos aquí."
        action={<NewServiceButton orgId={org.id} />}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Servicios activos
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {active.length}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                {inactive.length} pausados
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Precio promedio
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {fmt.format(avgPrice)}
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                antes de propina
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Duración promedio
              </p>
              <p className="mt-2 font-serif text-3xl font-semibold">
                {Math.round(avgDuration)} min
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                por cita
              </p>
            </div>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
              <div>
                <h2 className="font-serif text-lg font-semibold">
                  Catálogo completo
                </h2>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  {catalog.length === 0
                    ? "Aún no tienes servicios. Crea el primero para empezar."
                    : "Ajusta precios, pausa o edita sin perder el historial."}
                </p>
              </div>
            </div>

            {catalog.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Cuando crees tu primer servicio aparecerá aquí.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Servicio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalog.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium">{s.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={CATEGORY_STYLE[s.category]}
                        >
                          {s.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-[color:var(--muted-foreground)]" />
                          {s.durationMinutes} min
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-serif text-base font-semibold">
                        {fmt.format(s.priceMxn)}
                      </TableCell>
                      <TableCell>
                        {s.active ? (
                          <Badge className="bg-[oklch(0.94_0.04_150)] text-[oklch(0.38_0.12_150)] hover:bg-[oklch(0.94_0.04_150)]">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pausado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ServiceRowActions service={s} orgId={org.id} />
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
