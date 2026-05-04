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
import { BarberFormDialog } from "./barber-form";
import { deleteBarberAction, toggleBarberAction } from "./actions";
import type { Barber } from "@/lib/db/schema";

type ServiceOption = { id: string; name: string; category: string };

export function BarberRowActions({
  barber,
  assignedServiceIds,
  services,
}: {
  barber: Pick<
    Barber,
    "id" | "name" | "role" | "phone" | "avatarTone" | "active" | "workingHours"
  >;
  assignedServiceIds: string[];
  services: ServiceOption[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleBarberAction(barber.id, !barber.active);
        toast.success(barber.active ? "Barbero pausado" : "Barbero activado");
      } catch {
        toast.error("No se pudo actualizar");
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar a ${barber.name}? Sus citas quedarán sin asignar.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteBarberAction(barber.id);
        toast.success("Barbero eliminado");
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
            className="absolute right-4 top-4 rounded-md p-1 text-[color:var(--muted-foreground)] opacity-0 transition-opacity hover:bg-[oklch(0.97_0.005_80)] group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Más opciones"
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
            {barber.active ? (
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

      <BarberFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        config={{ mode: "edit", barber, assignedServiceIds }}
        services={services}
      />
    </>
  );
}
