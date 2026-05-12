"use client";

import { useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  User,
  Phone,
  Scissors,
  CalendarDays,
  Clock3,
  DollarSign,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import {
  updateAppointmentStatusAction,
  deleteAppointmentAction,
} from "./actions";
import type { AppointmentStatus } from "@/lib/validation/appointment";
import { mxnCurrency } from "@/lib/formatters";

export type AppointmentDetail = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceMxn: number;
  barberName: string;
  barberTone: string;
  serviceName: string;
  serviceDuration: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  confirmada: {
    label: "Confirmada",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  completada: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

export function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
  timezone,
}: {
  appointment: AppointmentDetail | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  timezone: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (!appointment) return null;

  const statusInfo = STATUS_MAP[appointment.status] ?? STATUS_MAP.confirmada;

  function handleStatus(next: AppointmentStatus, label: string) {
    startTransition(async () => {
      try {
        await updateAppointmentStatusAction(appointment!.id, next);
        toast.success(label);
        onOpenChange(false);
      } catch {
        toast.error("No se pudo actualizar");
      }
    });
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta cita?")) return;
    startTransition(async () => {
      try {
        await deleteAppointmentAction(appointment!.id);
        toast.success("Cita eliminada");
        onOpenChange(false);
      } catch {
        toast.error("No se pudo eliminar");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">
            {appointment.customerName}
          </SheetTitle>
          <SheetDescription>
            <Badge
              variant="outline"
              className={`mt-1 border ${statusInfo.className}`}
            >
              {statusInfo.label}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto py-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Cliente
                </p>
                <p className="text-sm font-medium">
                  {appointment.customerName}
                </p>
              </div>
            </div>

            {appointment.customerPhone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    Teléfono
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.customerPhone}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Scissors className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Servicio
                </p>
                <p className="text-sm font-medium">
                  {appointment.serviceName} · {appointment.serviceDuration}min
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Fecha y hora
                </p>
                <p className="text-sm font-medium">
                  {formatInTimeZone(
                    new Date(appointment.startsAt),
                    timezone,
                    "EEEE d 'de' MMMM"
                  )}
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {formatInTimeZone(
                    new Date(appointment.startsAt),
                    timezone,
                    "HH:mm"
                  )}{" "}
                  –{" "}
                  {formatInTimeZone(
                    new Date(appointment.endsAt),
                    timezone,
                    "HH:mm"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 h-4 w-4 rounded-full"
                style={{ background: appointment.barberTone }}
              />
              <div>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Barbero
                </p>
                <p className="text-sm font-medium">
                  {appointment.barberName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <div>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Precio
                </p>
                <p className="text-sm font-medium">
                  {mxnCurrency.format(appointment.priceMxn)}
                </p>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-[color:var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    Notas
                  </p>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[color:var(--border)] pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Acciones
            </p>
            <div className="flex flex-wrap gap-2">
              {appointment.status !== "completada" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleStatus("completada", "Cita completada")
                  }
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                  Completar
                </Button>
              )}
              {appointment.status !== "pendiente" &&
                appointment.status !== "completada" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      handleStatus("pendiente", "Marcada pendiente")
                    }
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                    Pendiente
                  </Button>
                )}
              {appointment.status !== "cancelada" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    handleStatus("cancelada", "Cita cancelada")
                  }
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                  Cancelar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
                className="text-[oklch(0.45_0.18_25)] hover:text-[oklch(0.45_0.18_25)]"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
