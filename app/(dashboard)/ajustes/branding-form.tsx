"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { updateBrandingAction, type OrgActionState } from "./actions";
import { ImageUpload } from "./image-upload";
import type { Organization } from "@/lib/db/schema";

const initialState: OrgActionState = {};

type BrandingOrg = Pick<
  Organization,
  | "id"
  | "tagline"
  | "about"
  | "addressNotes"
  | "logoUrl"
  | "heroImageUrl"
  | "primaryColor"
  | "instagramUrl"
  | "facebookUrl"
  | "tiktokUrl"
  | "googleMapsUrl"
  | "cancellationPolicy"
>;

export function BrandingForm({ org }: { org: BrandingOrg }) {
  const [state, formAction, isPending] = useActionState(
    updateBrandingAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) toast.success("Página pública actualizada");
    else if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);

  const err = (name: string) => state.fieldErrors?.[name];
  const errMsg = (name: string) =>
    err(name) ? (
      <p className="text-xs text-[oklch(0.45_0.18_25)]">{err(name)}</p>
    ) : null;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload
          name="logoUrl"
          label="Logo"
          orgId={org.id}
          kind="logo"
          initialUrl={org.logoUrl}
          aspect="square"
          help="Cuadrado, mínimo 256×256px, máx 3 MB"
        />
        <ImageUpload
          name="heroImageUrl"
          label="Foto del hero"
          orgId={org.id}
          kind="hero"
          initialUrl={org.heroImageUrl}
          aspect="wide"
          help="Horizontal, la imagen principal de tu página"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Frase corta (tagline)</Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={org.tagline ?? ""}
          placeholder="Cortes que hablan por ti"
          maxLength={120}
          disabled={isPending}
          aria-invalid={!!err("tagline")}
        />
        {errMsg("tagline")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">Acerca de (descripción larga)</Label>
        <textarea
          id="about"
          name="about"
          rows={4}
          defaultValue={org.about ?? ""}
          placeholder="Somos una barbería con 10 años de experiencia en..."
          maxLength={1000}
          disabled={isPending}
          className="w-full rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40"
        />
        {errMsg("about")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor">Color principal</Label>
        <div className="flex items-center gap-3">
          <Input
            id="primaryColor"
            name="primaryColor"
            defaultValue={org.primaryColor ?? ""}
            placeholder="#C85A28 o oklch(0.55 0.18 25)"
            maxLength={60}
            disabled={isPending}
            aria-invalid={!!err("primaryColor")}
          />
          {org.primaryColor ? (
            <span
              className="h-9 w-9 flex-shrink-0 rounded-md border border-[color:var(--border)]"
              style={{ background: org.primaryColor }}
            />
          ) : null}
        </div>
        {errMsg("primaryColor")}
      </div>

      <div className="space-y-3 border-t border-[color:var(--border)] pt-6">
        <p className="font-serif text-base font-semibold">Ubicación</p>
        <div className="space-y-2">
          <Label htmlFor="addressNotes">Cómo llegar (referencias)</Label>
          <Input
            id="addressNotes"
            name="addressNotes"
            defaultValue={org.addressNotes ?? ""}
            placeholder="Junto al Oxxo, segundo piso"
            maxLength={200}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="googleMapsUrl">Link de Google Maps</Label>
          <Input
            id="googleMapsUrl"
            name="googleMapsUrl"
            type="url"
            defaultValue={org.googleMapsUrl ?? ""}
            placeholder="https://maps.app.goo.gl/..."
            disabled={isPending}
            aria-invalid={!!err("googleMapsUrl")}
          />
          {errMsg("googleMapsUrl")}
        </div>
      </div>

      <div className="space-y-3 border-t border-[color:var(--border)] pt-6">
        <p className="font-serif text-base font-semibold">Redes sociales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              defaultValue={org.instagramUrl ?? ""}
              placeholder="https://instagram.com/..."
              disabled={isPending}
              aria-invalid={!!err("instagramUrl")}
            />
            {errMsg("instagramUrl")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input
              id="facebookUrl"
              name="facebookUrl"
              type="url"
              defaultValue={org.facebookUrl ?? ""}
              placeholder="https://facebook.com/..."
              disabled={isPending}
              aria-invalid={!!err("facebookUrl")}
            />
            {errMsg("facebookUrl")}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tiktokUrl">TikTok</Label>
            <Input
              id="tiktokUrl"
              name="tiktokUrl"
              type="url"
              defaultValue={org.tiktokUrl ?? ""}
              placeholder="https://tiktok.com/@..."
              disabled={isPending}
              aria-invalid={!!err("tiktokUrl")}
            />
            {errMsg("tiktokUrl")}
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-[color:var(--border)] pt-6">
        <p className="font-serif text-base font-semibold">Política de cancelación</p>
        <p className="text-xs text-[color:var(--muted-foreground)]">
          Se muestra al cliente al reservar. Ejemplo: "Puedes cancelar hasta 2
          horas antes. Después de eso no se devuelve el depósito."
        </p>
        <textarea
          id="cancellationPolicy"
          name="cancellationPolicy"
          rows={4}
          defaultValue={org.cancellationPolicy ?? ""}
          maxLength={2000}
          disabled={isPending}
          className="w-full rounded-md border border-[color:var(--border)] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40"
        />
        {errMsg("cancellationPolicy")}
      </div>

      <div className="flex justify-end border-t border-[color:var(--border)] pt-5">
        <Button type="submit" disabled={isPending}>
          <Check className="mr-1 h-4 w-4" />
          {isPending ? "Guardando..." : "Guardar página pública"}
        </Button>
      </div>
    </form>
  );
}
