"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginAction, type ActionState } from "@/app/(auth)/actions";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/recuperar"
            className="text-xs text-[color:var(--muted-foreground)] underline-offset-4 hover:text-[color:var(--foreground)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
        {isPending ? "Entrando..." : "Entrar al panel"}
        {!isPending && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  );
}
