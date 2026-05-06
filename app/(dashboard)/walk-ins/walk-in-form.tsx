"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createWalkInAction, type WalkInActionState } from "./actions";
import type { BarberOption, ServiceOption } from "@/app/(dashboard)/agenda/new-appointment-dialog";

const initialState: WalkInActionState = {};
const NONE = "_none_";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registrando…
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Registrar venta
        </>
      )}
    </Button>
  );
}

export function WalkInForm({
  barbers,
  services,
  serviceIdsByBarber,
  defaultDate,
}: {
  barbers: BarberOption[];
  services: ServiceOption[];
  serviceIdsByBarber: Record<string, string[]>;
  defaultDate: string;
}) {
  const [state, formAction] = useActionState(createWalkInAction, initialState);
  const [barberId, setBarberId] = useState(NONE);
  const [serviceId, setServiceId] = useState(NONE);

  const availableServices = useMemo(() => {
    if (!barberId || barberId === NONE) return services;
    const assigned = serviceIdsByBarber[barberId];
    if (!assigned || assigned.length === 0) return services;
    const idSet = new Set(assigned);
    return services.filter((s) => idSet.has(s.id));
  }, [barberId, services, serviceIdsByBarber]);

  useEffect(() => {
    if (state.ok) {
      toast.success("Venta registrada");
      setBarberId(NONE);
      setServiceId(NONE);
      const form = document.getElementById("walk-in-form") as HTMLFormElement;
      form?.reset();
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (barberId && barberId !== NONE) {
      const assigned = serviceIdsByBarber[barberId];
      const filtered =
        assigned && assigned.length > 0
          ? services.filter((s) => new Set(assigned).has(s.id))
          : services;
      if (!filtered.find((s) => s.id === serviceId)) {
        setServiceId(NONE);
      }
    }
  }, [barberId, services, serviceIdsByBarber, serviceId]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form id="walk-in-form" action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="walkin-price">Monto (MXN)</Label>
        <Input
          id="walkin-price"
          name="priceMxn"
          type="number"
          inputMode="numeric"
          placeholder="250"
          required
          autoFocus
          aria-invalid={!!fieldError("priceMxn")}
        />
        {fieldError("priceMxn") && (
          <p className="text-xs text-[oklch(0.45_0.18_25)]">
            {fieldError("priceMxn")}
          </p>
        )}
      </div>

      <input type="hidden" name="date" value={defaultDate} />
      <input type="hidden" name="barberId" value={barberId === NONE ? "" : barberId} />
      <input type="hidden" name="serviceId" value={serviceId === NONE ? "" : serviceId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="walkin-barber">Barbero (opcional)</Label>
          <Select value={barberId} onValueChange={setBarberId}>
            <SelectTrigger id="walkin-barber">
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin asignar</SelectItem>
              {barbers.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="walkin-service">Servicio (opcional)</Label>
          <Select
            value={serviceId}
            onValueChange={setServiceId}
            disabled={availableServices.length === 0}
          >
            <SelectTrigger id="walkin-service">
              <SelectValue
                placeholder={
                  availableServices.length === 0
                    ? "Sin servicios"
                    : "Sin asignar"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sin asignar</SelectItem>
              {availableServices.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} · ${s.priceMxn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="walkin-notes">Notas (opcional)</Label>
        <textarea
          id="walkin-notes"
          name="notes"
          rows={2}
          placeholder="Corte degrade, pagó en efectivo..."
          className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
