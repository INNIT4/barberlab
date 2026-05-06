"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  updateOrganizationAction,
  type OrgActionState,
} from "./actions";
import type { Organization } from "@/lib/db/schema";

const initialState: OrgActionState = {};

export function OrganizationForm({
  org,
}: {
  org: Pick<Organization, "name" | "slug" | "phone" | "email" | "address">;
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrganizationAction,
    initialState
  );

  const [slug, setSlug] = useState(org.slug);

  useEffect(() => {
    if (state.ok) toast.success("Cambios guardados");
    else if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  function copySlug() {
    const url = `https://barberlab.app/b/${slug}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("URL copiada"),
      () => toast.error("No se pudo copiar")
    );
  }

  return (
    <form action={formAction}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={org.name}
            required
            disabled={isPending}
            aria-invalid={!!fieldError("name")}
          />
          {fieldError("name") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("name")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL pública</Label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-md border border-[color:var(--border)] bg-[oklch(0.985_0.005_80)] focus-within:ring-2 focus-within:ring-[color:var(--ring)]/40">
              <span className="px-3 text-xs text-[color:var(--muted-foreground)]">
                barberlab.app/b/
              </span>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-+|-+$/g, "")
                  )
                }
                required
                disabled={isPending}
                className="h-9 border-0 bg-transparent px-0 focus-visible:ring-0"
                aria-invalid={!!fieldError("slug")}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-9 w-9"
              onClick={copySlug}
              disabled={isPending}
              aria-label="Copiar URL"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {fieldError("slug") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("slug")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={org.phone ?? ""}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={org.email ?? ""}
            disabled={isPending}
            aria-invalid={!!fieldError("email")}
          />
          {fieldError("email") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("email")}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            defaultValue={org.address ?? ""}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-[color:var(--border)] pt-5">
        <Button type="submit" disabled={isPending}>
          <Check className="mr-1 h-4 w-4" />
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
