"use client";

import { useTransition } from "react";
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteAppointmentAction,
  updateAppointmentStatusAction,
} from "./actions";
import type { AppointmentStatus } from "@/lib/validation/appointment";

export function AppointmentRowActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: AppointmentStatus, label: string) {
    startTransition(async () => {
      try {
        await updateAppointmentStatusAction(id, next);
        toast.success(label);
      } catch {
        toast.error("No se pudo actualizar la cita");
      }
    });
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta cita?")) return;
    startTransition(async () => {
      try {
        await deleteAppointmentAction(id);
        toast.success("Cita eliminada");
      } catch {
        toast.error("No se pudo eliminar");
      }
    });
  }

  return (
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
      <DropdownMenuContent align="end" className="w-48">
        {status !== "completada" ? (
          <DropdownMenuItem
            onSelect={() => setStatus("completada", "Cita completada")}
          >
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
            Marcar completada
          </DropdownMenuItem>
        ) : null}
        {status !== "pendiente" && status !== "completada" ? (
          <DropdownMenuItem
            onSelect={() => setStatus("pendiente", "Cita marcada pendiente")}
          >
            <Clock className="mr-2 h-3.5 w-3.5" />
            Marcar pendiente
          </DropdownMenuItem>
        ) : null}
        {status !== "cancelada" ? (
          <DropdownMenuItem
            onSelect={() => setStatus("cancelada", "Cita cancelada")}
          >
            <XCircle className="mr-2 h-3.5 w-3.5" />
            Cancelar cita
          </DropdownMenuItem>
        ) : null}
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
  );
}
