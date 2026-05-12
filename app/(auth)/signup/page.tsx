import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, gt } from "drizzle-orm";
import { PLAN_BY_ID, PLANS, type PlanId } from "@/lib/data/plans";
import { Check, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { mxnCurrency } from "@/lib/formatters";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta — BarberLab",
  description:
    "Prueba BarberLab 1 mes gratis. Sin tarjeta al empezar, cancela cuando quieras.",
};

function isPlanId(value: string | undefined): value is PlanId {
  return value === "starter" || value === "pro" || value === "premium";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; invite?: string }>;
}) {
  const params = await searchParams;
  const planId: PlanId = isPlanId(params?.plan) ? params.plan : "pro";
  const plan = PLAN_BY_ID[planId];
  const inviteToken = params?.invite ?? "";

  let inviteOrgName: string | null = null;
  if (inviteToken) {
    const invite = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.token, inviteToken),
        gt(invitations.expiresAt, new Date())
      ),
      with: { organization: { columns: { name: true } } },
    });
    if (invite && !invite.acceptedAt) {
      inviteOrgName = invite.organization.name;
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3 w-3 text-[oklch(0.55_0.18_70)]" />
          1 mes gratis · sin tarjeta
        </span>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
          Crea tu BarberLab.
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Tu página pública y agenda listas en menos de 10 minutos.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 rounded-xl border border-[color:var(--border)] bg-[oklch(0.985_0.008_80)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Plan seleccionado
              </p>
              <p className="mt-1 font-serif text-lg font-semibold">
                {plan.name}
                <span className="ml-2 text-sm font-normal text-[color:var(--muted-foreground)]">
                  {mxnCurrency.format(plan.priceMxn)} MXN/mes
                </span>
              </p>
            </div>
            <PlanSwitcher current={planId} />
          </div>
          <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
            {plan.tagline} Podrás cambiar de plan cuando quieras.
          </p>
        </div>

        <SignupForm inviteToken={inviteToken} inviteOrgName={inviteOrgName} planId={planId} />

        <ul className="mt-6 grid gap-2 text-xs text-[color:var(--muted-foreground)] sm:grid-cols-3">
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[oklch(0.5_0.15_150)]" />
            Sin tarjeta
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[oklch(0.5_0.15_150)]" />
            Cancela cuando quieras
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[oklch(0.5_0.15_150)]" />
            Soporte en español
          </li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-[color:var(--muted-foreground)]">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

function PlanSwitcher({ current }: { current: PlanId }) {
  return (
    <div className="inline-flex rounded-md border border-[color:var(--border)] bg-[color:var(--background)] p-0.5">
      {PLANS.map((p) => {
        const active = p.id === current;
        return (
          <Link
            key={p.id}
            href={`/signup?plan=${p.id}`}
            className={
              "rounded px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]")
            }
          >
            {p.name}
          </Link>
        );
      })}
    </div>
  );
}
