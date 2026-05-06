"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createCheckoutSessionAction,
  type CheckoutState,
} from "./checkout-actions";
import type { PlanId } from "@/lib/data/plans";

const initial: CheckoutState = {};

export function CheckoutButton({
  plan,
  label,
  className,
}: {
  plan: PlanId;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createCheckoutSessionAction,
    initial
  );

  const fe = (f: string) => state.fieldErrors?.[f];

  return (
    <>
      <Button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Empezar con plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </DialogTitle>
            <DialogDescription>
              14 días gratis · sin tarjeta al empezar. Completarás el pago en Stripe.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="mt-2 flex flex-col gap-4">
            <input type="hidden" name="plan" value={plan} />

            <div className="space-y-1.5">
              <Label htmlFor={`email-${plan}`}>Tu email</Label>
              <Input
                id={`email-${plan}`}
                name="email"
                type="email"
                placeholder="hola@mibarberia.mx"
                required
                disabled={isPending}
                aria-invalid={!!fe("email")}
              />
              {fe("email") && (
                <p className="text-xs text-destructive">{fe("email")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`biz-${plan}`}>Nombre de tu barbería</Label>
              <Input
                id={`biz-${plan}`}
                name="businessName"
                placeholder="Barbería El Clásico"
                required
                disabled={isPending}
                aria-invalid={!!fe("businessName")}
              />
              {fe("businessName") && (
                <p className="text-xs text-destructive">{fe("businessName")}</p>
              )}
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo…
                </>
              ) : (
                "Continuar a pago →"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
