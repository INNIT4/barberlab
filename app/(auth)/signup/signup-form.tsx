"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { signupAction, type ActionState } from "@/app/(auth)/actions";

const initialState: ActionState = {};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function SignupForm({
  inviteToken,
  inviteOrgName,
}: {
  inviteToken?: string;
  inviteOrgName?: string | null;
}) {
  const isInvite = inviteOrgName != null && inviteToken != null;

  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState
  );
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleShopChange(v: string) {
    setShopName(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  function handleSlugChange(v: string) {
    setSlug(slugify(v));
    setSlugEdited(true);
  }

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="space-y-5">
      {inviteToken ? <input type="hidden" name="invite" value={inviteToken} /> : null}

      {isInvite ? (
        <div className="rounded-lg border border-[oklch(0.85_0.06_150)] bg-[oklch(0.97_0.03_150)] px-3 py-2 text-sm text-[oklch(0.35_0.12_150)]">
          Te estás uniendo a <strong>{inviteOrgName}</strong> como staff.
        </div>
      ) : null}

      <div className={isInvite ? "" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <Label htmlFor="owner">Tu nombre</Label>
          <Input
            id="owner"
            name="owner"
            placeholder="Tony Méndez"
            required
            disabled={isPending}
            aria-invalid={!!fieldError("owner")}
          />
          {fieldError("owner") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("owner")}
            </p>
          )}
        </div>
        {isInvite ? null : (
          <div className="space-y-2">
            <Label htmlFor="shop">Nombre de la barbería</Label>
            <Input
              id="shop"
              name="shop"
              placeholder="Tony Barber Shop"
              value={shopName}
              onChange={(e) => handleShopChange(e.target.value)}
              required
              disabled={isPending}
              aria-invalid={!!fieldError("shop")}
            />
            {fieldError("shop") && (
              <p className="text-xs text-[oklch(0.45_0.18_25)]">
                {fieldError("shop")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@barberia.mx"
          autoComplete="email"
          required
          disabled={isPending}
          aria-invalid={!!fieldError("email")}
        />
        {fieldError("email") && (
          <p className="text-xs text-[oklch(0.45_0.18_25)]">
            {fieldError("email")}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+52 662 123 4567"
            required
            disabled={isPending}
            aria-invalid={!!fieldError("phone")}
          />
          {fieldError("phone") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("phone")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={isPending}
            aria-invalid={!!fieldError("password")}
          />
          {fieldError("password") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("password")}
            </p>
          )}
        </div>
      </div>

      {isInvite ? null : (
        <div className="space-y-2">
          <Label htmlFor="slug">Tu URL pública</Label>
          <div className="flex items-center rounded-md border border-[color:var(--border)] bg-[oklch(0.985_0.005_80)] focus-within:ring-2 focus-within:ring-[color:var(--ring)]/40">
            <span className="px-3 text-xs text-[color:var(--muted-foreground)]">
              barberlab.app/b/
            </span>
            <Input
              id="slug"
              name="slug"
              placeholder="tony-barber"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="h-9 border-0 bg-transparent px-0 focus-visible:ring-0"
              required
              disabled={isPending}
              aria-invalid={!!fieldError("slug")}
            />
          </div>
          {fieldError("slug") ? (
            <p className="text-[11px] text-[oklch(0.45_0.18_25)]">
              {fieldError("slug")}
            </p>
          ) : (
            <p className="text-[11px] text-[color:var(--muted-foreground)]">
              Así te encuentran tus clientes. Puedes cambiarla después.
            </p>
          )}
        </div>
      )}

      <label className="flex items-start gap-2 text-xs text-[color:var(--muted-foreground)]">
        <input
          type="checkbox"
          required
          disabled={isPending}
          className="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] accent-[oklch(0.45_0.15_25)]"
        />
        <span>
          Acepto los{" "}
          <Link
            href="/terminos"
            className="underline underline-offset-2 hover:text-[color:var(--foreground)]"
          >
            términos
          </Link>{" "}
          y el{" "}
          <Link
            href="/privacidad"
            className="underline underline-offset-2 hover:text-[color:var(--foreground)]"
          >
            aviso de privacidad
          </Link>
          .
        </span>
      </label>

      {state.error && !state.fieldErrors ? (
        <div className="rounded-md border border-[oklch(0.8_0.12_25)] bg-[oklch(0.97_0.03_25)] px-3 py-2 text-sm text-[oklch(0.4_0.15_25)]">
          {state.error}
        </div>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {isPending ? "Creando tu cuenta..." : "Empezar prueba de 14 días"}
        {!isPending && <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
    </form>
  );
}
