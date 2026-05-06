"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadOrgImage } from "@/lib/storage/upload";

/**
 * Generic image uploader bound to a hidden form input.
 * Used by branding form and service form.
 */
export function ImageUploadField({
  name,
  label,
  orgId,
  kind,
  initialUrl,
  aspect = "square",
  help,
}: {
  name: string;
  label: string;
  orgId: string;
  kind: string;
  initialUrl: string | null;
  aspect?: "square" | "wide" | "card";
  help?: string;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    startTransition(async () => {
      try {
        const result = await uploadOrgImage(file, orgId, kind);
        setUrl(result.url);
        toast.success("Imagen subida");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir");
      }
    });
  }

  const boxClass =
    aspect === "wide"
      ? "relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[color:var(--border)] bg-[oklch(0.97_0.005_80)]"
      : aspect === "card"
        ? "relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[color:var(--border)] bg-[oklch(0.97_0.005_80)]"
        : "relative h-24 w-24 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[oklch(0.97_0.005_80)]";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {help && (
        <p className="text-xs text-[color:var(--muted-foreground)]">{help}</p>
      )}
      <div className="flex items-start gap-3">
        <div className={boxClass}>
          {url ? (
            <Image
              src={url}
              alt={label}
              fill
              sizes={aspect === "square" ? "96px" : "600px"}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[color:var(--muted-foreground)]">
              <Upload className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1 h-3.5 w-3.5" />
            {isPending ? "Subiendo..." : url ? "Cambiar" : "Subir"}
          </Button>
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setUrl(null)}
              className="text-[oklch(0.5_0.18_25)]"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Quitar
            </Button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      <input type="hidden" name={name} value={url ?? ""} />
    </div>
  );
}
