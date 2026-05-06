"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceFormDialog } from "./service-form";
import { deleteServiceAction, toggleServiceAction } from "./actions";
import type { Service } from "@/lib/db/schema";

export function ServiceRowActions({
  service,
  orgId,
}: {
  service: Pick<
    Service,
    "id" | "name" | "category" | "durationMinutes" | "priceMxn" | "active" | "imageUrl"
  >;
  orgId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleServiceAction(service.id, !service.active);
        toast.success(service.active ? "Servicio pausado" : "Servicio activado");
      } catch {
        toast.error("No se pudo actualizar el servicio");
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteServiceAction(service.id);
        toast.success("Servicio eliminado");
      } catch {
        toast.error("No se pudo eliminar");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-md p-1 text-[color:var(--muted-foreground)] hover:bg-[oklch(0.97_0.005_80)]"
            aria-label="Opciones"
            disabled={isPending}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggle}>
            {service.active ? (
              <>
                <Pause className="mr-2 h-3.5 w-3.5" />
                Pausar
              </>
            ) : (
              <>
                <Play className="mr-2 h-3.5 w-3.5" />
                Activar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleDelete}
            className="text-[oklch(0.45_0.18_25)] focus:text-[oklch(0.45_0.18_25)]"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ServiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        orgId={orgId}
        config={{ mode: "edit", service }}
      />
    </>
  );
}
