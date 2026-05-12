"use client";

import { useTransition } from "react";
import { CreditCard, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBillingPortalSessionAction, createSubscriptionCheckoutAction } from "./billing-actions";
import type { PlanId } from "@/lib/data/plans";
import { PLAN_BY_ID } from "@/lib/data/plans";

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  trialing: "Período de prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Sin pagar",
};

export function BillingSection({
  plan,
  stripeStatus,
  stripeCurrentPeriodEnd,
  hasStripe,
}: {
  plan: PlanId;
  stripeStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
  hasStripe: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const planData = PLAN_BY_ID[plan];

  function openPortal() {
    startTransition(async () => {
      const result = await createBillingPortalSessionAction();
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function startSubscription() {
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction();
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  const statusLabel = stripeStatus ? (STATUS_LABEL[stripeStatus] ?? stripeStatus) : null;
  const isPastDue = stripeStatus === "past_due" || stripeStatus === "unpaid";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">Suscripción</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan actual
            </p>
            <p className="mt-1 font-serif text-lg font-semibold">
              {planData.name}
            </p>
            <p className="text-sm text-muted-foreground">{planData.tagline}</p>
          </div>

          {statusLabel && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isPastDue
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {isPastDue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              {statusLabel}
            </span>
          )}
        </div>

        {stripeCurrentPeriodEnd && (
          <p className="text-sm text-muted-foreground">
            {stripeStatus === "trialing" ? "Prueba gratuita hasta" : "Próxima renovación"}:{" "}
            <span className="font-medium text-foreground">
              {stripeCurrentPeriodEnd.toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        )}

        {isPastDue && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Hay un problema con tu pago. Actualiza tu método de pago para
            continuar usando BarberLab.
          </div>
        )}

        {hasStripe ? (
          <Button
            variant="outline"
            onClick={openPortal}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abriendo portal…
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Gestionar suscripción
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={startSubscription}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo…
              </>
            ) : (
              <>
                Activar suscripción
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
