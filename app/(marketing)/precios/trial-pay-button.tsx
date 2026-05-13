"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSubscriptionCheckoutAction } from "@/app/(dashboard)/ajustes/billing-actions";
import type { PlanId } from "@/lib/data/plans";

export function TrialPayButton({ plan, label }: { plan: PlanId; label: string }) {
  const [isPending, startTransition] = useTransition();

  function handlePay() {
    startTransition(async () => {
      const result = await createSubscriptionCheckoutAction(plan);
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      onClick={handlePay}
      disabled={isPending}
      className="h-11 w-full text-[0.78rem] uppercase tracking-[0.2em] shadow-[3px_3px_0_var(--ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {isPending ? "Redirigiendo…" : label}
    </Button>
  );
}
