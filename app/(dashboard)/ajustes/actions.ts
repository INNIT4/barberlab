"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/auth/current-user";
import { canUseBranding } from "@/lib/features/can";
import { brandingSchema, organizationSchema } from "@/lib/validation/organization";

export type OrgActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function buildFieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  });
  return fieldErrors;
}

export async function updateOrganizationAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede modificar la información del negocio" };

  const parsed = organizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
  });

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  if (data.slug !== org.slug) {
    const taken = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.slug, data.slug),
        ne(organizations.id, org.id)
      ),
    });
    if (taken) {
      return {
        error: "Esa URL pública ya está en uso",
        fieldErrors: { slug: "Elige otra URL" },
      };
    }
  }

  await db
    .update(organizations)
    .set({
      name: data.name,
      slug: data.slug,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, org.id));

  revalidatePath("/ajustes");
  revalidatePath("/agenda");
  return { ok: true };
}

export async function updateBrandingAction(
  _prev: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const { org, role } = await getCurrentOrg();
  if (role !== "owner") return { error: "Solo el dueño puede modificar la apariencia" };

  if (!canUseBranding(org.plan)) {
    return { error: "Necesitas el plan Pro para personalizar tu página." };
  }

  const parsed = brandingSchema.safeParse({
    tagline: formData.get("tagline") ?? "",
    about: formData.get("about") ?? "",
    addressNotes: formData.get("addressNotes") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    heroImageUrl: formData.get("heroImageUrl") ?? "",
    primaryColor: formData.get("primaryColor") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    tiktokUrl: formData.get("tiktokUrl") ?? "",
    googleMapsUrl: formData.get("googleMapsUrl") ?? "",
    cancellationPolicy: formData.get("cancellationPolicy") ?? "",
  });

  if (!parsed.success) {
    return {
      error: "Revisa los datos",
      fieldErrors: buildFieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  await db
    .update(organizations)
    .set({
      tagline: data.tagline ?? null,
      about: data.about ?? null,
      addressNotes: data.addressNotes ?? null,
      logoUrl: data.logoUrl ?? null,
      heroImageUrl: data.heroImageUrl ?? null,
      primaryColor: data.primaryColor ?? null,
      instagramUrl: data.instagramUrl ?? null,
      facebookUrl: data.facebookUrl ?? null,
      tiktokUrl: data.tiktokUrl ?? null,
      googleMapsUrl: data.googleMapsUrl ?? null,
      cancellationPolicy: data.cancellationPolicy ?? null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, org.id));

  revalidatePath("/ajustes");
  return { ok: true };
}
