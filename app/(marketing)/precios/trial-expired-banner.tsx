"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSubscriptionCheckoutAction } from "@/app/(dashboard)/ajustes/billing-actions";

export function TrialExpiredBanner({ plan }: { plan?: string }) {
  const [isPending, startTransition] = useTransition();

  function handlePay() {
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction();
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-[oklch(0.6_0.22_30)] bg-[oklch(0.97_0.03_25)] p-6 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[oklch(0.92_0.06_25)]">
          <AlertTriangle className="h-6 w-6 text-[oklch(0.45_0.18_25)]" />
        </div>
        <div className="flex-1">
          <p className="font-serif text-lg font-semibold text-[oklch(0.35_0.15_25)]">
            Tu prueba gratuita terminó
          </p>
          <p className="mt-1 text-sm text-[oklch(0.4_0.1_25)]">
            Activa tu suscripción para volver a usar BarberLab. Tu barbería y
            datos siguen guardados.
            {plan ? ` Plan actual: ${plan.charAt(0).toUpperCase() + plan.slice(1)}.` : ""}
          </p>
        </div>
        <Button
          onClick={handlePay}
          disabled={isPending}
          className="flex-none bg-[oklch(0.45_0.18_25)] text-white hover:bg-[oklch(0.35_0.15_25)]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirigiendo…
            </>
          ) : (
            "Activar suscripción"
          )}
        </Button>
      </div>
    </div>
  );
}
