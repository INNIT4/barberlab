"use client";

import { ImageUploadField } from "@/components/image-upload-field";

/** @deprecated Usa ImageUploadField directamente. Mantenido por compatibilidad. */
export function ImageUpload(props: {
  name: string;
  label: string;
  orgId: string;
  kind: "logo" | "hero";
  initialUrl: string | null;
  aspect?: "square" | "wide";
  help?: string;
}) {
  return <ImageUploadField {...props} />;
}
