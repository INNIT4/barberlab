"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";
import { resetPasswordAction, type ActionState } from "@/app/(auth)/actions";

const initialState: ActionState = {};

export function RecuperarForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  if (state?.ok) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.9_0.06_150)]">
          <CheckCircle className="h-6 w-6 text-[oklch(0.45_0.15_150)]" />
        </div>
        <div>
          <p className="font-serif text-lg font-semibold">Email enviado</p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            Si el email existe en nuestro sistema, recibirás un enlace para
            restablecer tu contraseña.
          </p>
        </div>
        <p className="text-xs text-[color:var(--muted-foreground)]">
          ¿No lo recibiste?{" "}
          <button
            onClick={() => window.location.reload()}
            className="font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
          >
            Intenta de nuevo
          </button>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email de tu cuenta</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@barberia.mx"
            autoComplete="email"
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
        {isPending ? "Enviando..." : "Enviar enlace"}
        {!isPending && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>

      <p className="text-center text-xs text-[color:var(--muted-foreground)]">
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-[color:var(--foreground)]"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
