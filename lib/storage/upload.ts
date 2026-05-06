import { createClient } from "@/lib/supabase/client";

const BUCKET = "branding";

export type UploadResult = { url: string; path: string };

/**
 * Uploads an image to the branding bucket under org/{orgId}/{kind}-{timestamp}.{ext}
 * Returns the public URL and storage path. Throws on error.
 */
export async function uploadBrandingImage(
  file: File,
  orgId: string,
  kind: "logo" | "hero"
): Promise<UploadResult> {
  return uploadOrgImage(file, orgId, kind);
}

/**
 * Generic uploader for any org-scoped image (logos, hero, services, etc.).
 */
export async function uploadOrgImage(
  file: File,
  orgId: string,
  kind: string
): Promise<UploadResult> {
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("La imagen no puede superar 3 MB");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes");
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${orgId}/${kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
