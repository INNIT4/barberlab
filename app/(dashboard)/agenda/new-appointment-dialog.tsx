"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  createAppointmentAction,
  type AppointmentActionState,
} from "./actions";

const initialState: AppointmentActionState = {};
const NEW_CUSTOMER = "__new__";

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export type BarberOption = { id: string; name: string };
export type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  priceMxn: number;
};
export type CustomerOption = { id: string; name: string; phone: string };

export function NewAppointmentButton(props: {
  barbers: BarberOption[];
  services: ServiceOption[];
  customers: CustomerOption[];
  defaultDate: string;
  serviceIdsByBarber: Record<string, string[]>;
}) {
  const [open, setOpen] = useState(false);
  const disabled = props.barbers.length === 0 || props.services.length === 0;
  return (
    <>
      <Button
        size="sm"
        className="shadow-sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={
          disabled
            ? "Necesitas al menos 1 barbero y 1 servicio activo"
            : undefined
        }
      >
        <Plus className="mr-1 h-4 w-4" />
        Nueva cita
      </Button>
      <NewAppointmentDialog {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewAppointmentDialog({
  barbers,
  services,
  customers,
  defaultDate,
  serviceIdsByBarber,
  open,
  onOpenChange,
}: {
  barbers: BarberOption[];
  services: ServiceOption[];
  customers: CustomerOption[];
  defaultDate: string;
  serviceIdsByBarber: Record<string, string[]>;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    initialState
  );

  const [barberId, setBarberId] = useState<string>(barbers[0]?.id ?? "");
  const [serviceId, setServiceId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>(
    customers[0]?.id ?? NEW_CUSTOMER
  );

  const availableServices = useMemo(() => {
    const assigned = serviceIdsByBarber[barberId];
    if (!assigned || assigned.length === 0) return services;
    const idSet = new Set(assigned);
    return services.filter((s) => idSet.has(s.id));
  }, [barberId, services, serviceIdsByBarber]);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Cita creada");
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  useEffect(() => {
    if (!open) {
      const firstBarberId = barbers[0]?.id ?? "";
      setBarberId(firstBarberId);
      setCustomerId(customers[0]?.id ?? NEW_CUSTOMER);
      const assigned = serviceIdsByBarber[firstBarberId];
      const filtered = assigned && assigned.length > 0
        ? services.filter((s) => new Set(assigned).has(s.id))
        : services;
      setServiceId(filtered[0]?.id ?? "");
    }
  }, [open, barbers, services, customers, serviceIdsByBarber]);

  useEffect(() => {
    if (barberId) {
      const assigned = serviceIdsByBarber[barberId];
      const filtered = assigned && assigned.length > 0
        ? services.filter((s) => new Set(assigned).has(s.id))
        : services;
      if (!filtered.find((s) => s.id === serviceId)) {
        setServiceId(filtered[0]?.id ?? "");
      }
    }
  }, [barberId, services, serviceIdsByBarber]);

  const fieldError = (name: string) => state.fieldErrors?.[name];
  const isNewCustomer = customerId === NEW_CUSTOMER;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Nueva cita</DialogTitle>
          <DialogDescription>
            Selecciona barbero, servicio y horario. El precio y la duración se
            toman del servicio.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="barberId" value={barberId} />
          <input type="hidden" name="serviceId" value={serviceId} />
          <input
            type="hidden"
            name="customerId"
            value={isNewCustomer ? "" : customerId}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="barber">Barbero</Label>
              <Select
                value={barberId}
                onValueChange={setBarberId}
                disabled={isPending}
              >
                <SelectTrigger id="barber">
                  <SelectValue placeholder="Selecciona barbero" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("barberId") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("barberId")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Servicio</Label>
              <Select
                value={serviceId}
                onValueChange={setServiceId}
                disabled={isPending || availableServices.length === 0}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder={
                    availableServices.length === 0
                      ? "Sin servicios asignados"
                      : "Selecciona servicio"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.durationMinutes}min ·{" "}
                      {fmt.format(s.priceMxn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("serviceId") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("serviceId")}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultDate}
                required
                disabled={isPending}
                aria-invalid={!!fieldError("date")}
              />
              {fieldError("date") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("date")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                name="time"
                type="time"
                step={900}
                defaultValue="10:00"
                required
                disabled={isPending}
                aria-invalid={!!fieldError("time")}
              />
              {fieldError("time") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("time")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Cliente</Label>
            <Select
              value={customerId}
              onValueChange={setCustomerId}
              disabled={isPending}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Selecciona cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NEW_CUSTOMER}>
                  + Cliente nuevo
                </SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("customerId") && (
              <p className="text-xs text-[oklch(0.45_0.18_25)]">
                {fieldError("customerId")}
              </p>
            )}
          </div>

          {isNewCustomer ? (
            <div className="grid gap-4 rounded-lg border border-dashed border-[color:var(--border)] p-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newCustomerName">Nombre del cliente</Label>
                <Input
                  id="newCustomerName"
                  name="newCustomerName"
                  placeholder="Luis Ramírez"
                  disabled={isPending}
                  aria-invalid={!!fieldError("newCustomerName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCustomerPhone">Teléfono</Label>
                <Input
                  id="newCustomerPhone"
                  name="newCustomerPhone"
                  type="tel"
                  placeholder="+52 662..."
                  disabled={isPending}
                  aria-invalid={!!fieldError("newCustomerPhone")}
                />
                {fieldError("newCustomerPhone") && (
                  <p className="text-xs text-[oklch(0.45_0.18_25)]">
                    {fieldError("newCustomerPhone")}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Preferencias, observaciones..."
              disabled={isPending}
              className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:opacity-50"
            />
          </div>

          {service ? (
            <p className="rounded-md bg-[oklch(0.97_0.01_80)] px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
              Duración: {service.durationMinutes} min · Precio:{" "}
              {fmt.format(service.priceMxn)}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
