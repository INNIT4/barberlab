"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteAccountAction } from "./danger-actions";

export function DangerZone({ orgName }: { orgName: string }) {
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (confirm !== orgName) return;
    setPending(true);
    try {
      const result = await deleteAccountAction();
      if (result?.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar la cuenta");
    }
    setPending(false);
  }

  return (
    <section className="rounded-2xl border border-[oklch(0.8_0.12_25)] bg-[oklch(0.98_0.02_25)] p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[oklch(0.45_0.18_25)]" />
        <div className="flex-1">
          <h2 className="font-serif text-lg font-semibold text-[oklch(0.35_0.15_25)]">
            Eliminar cuenta
          </h2>
          <p className="mt-1 text-sm text-[oklch(0.4_0.12_25)]">
            Esta acción es irreversible. Se eliminarán todos los barberos, servicios,
            clientes, citas y la página pública.
          </p>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="confirmDelete"
                className="text-sm text-[oklch(0.35_0.15_25)]"
              >
                Escribe <strong>{orgName}</strong> para confirmar
              </Label>
              <Input
                id="confirmDelete"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={orgName}
                disabled={pending}
                className="border-[oklch(0.75_0.1_25)] bg-white"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={confirm !== orgName || pending}
            >
              {pending ? "Eliminando..." : "Eliminar cuenta permanentemente"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
