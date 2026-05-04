"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock } from "lucide-react";
import { updatePasswordAction, type ActionState } from "@/app/(auth)/actions";

const initialState: ActionState = {};

export function ActualizarContrasenaForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className="pl-9"
            required
            minLength={8}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            className="pl-9"
            required
            disabled={isPending}
          />
        </div>
      </div>

      {state.error ? (
        <div className="rounded-md border border-[oklch(0.8_0.12_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-sm text-[oklch(0.4_0.15_25)]">
          {state.error}
        </div>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar nueva contraseña"}
        {!isPending && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  );
}
