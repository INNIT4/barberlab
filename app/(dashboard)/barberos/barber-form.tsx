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
import { Plus, Scissors } from "lucide-react";
import { toast } from "sonner";
import {
  createBarberAction,
  updateBarberAction,
  type BarberActionState,
} from "./actions";
import { BARBER_TONES } from "@/lib/validation/barber";
import type { Barber } from "@/lib/db/schema";
import { DEFAULT_WORKING_HOURS, type WorkingHours } from "@/lib/data/working-hours";
import { WorkingHoursEditor } from "./working-hours-editor";

const initialState: BarberActionState = {};

type EditableBarber = Pick<
  Barber,
  "id" | "name" | "role" | "phone" | "avatarTone" | "workingHours"
>;

type ServiceOption = { id: string; name: string; category: string };
type Mode =
  | { mode: "create" }
  | { mode: "edit"; barber: EditableBarber; assignedServiceIds: string[] };

const CATEGORY_LABEL: Record<string, string> = {
  Corte: "Cortes",
  Barba: "Barba",
  Combo: "Combos",
  Extras: "Extras",
};

export function NewBarberButton({
  disabled,
  services,
}: {
  disabled?: boolean;
  services: ServiceOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="shadow-sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={
          disabled
            ? "Alcanzaste el límite de tu plan. Actualiza para agregar más."
            : undefined
        }
      >
        <Plus className="mr-1 h-4 w-4" />
        Agregar barbero
      </Button>
      <BarberFormDialog
        open={open}
        onOpenChange={setOpen}
        config={{ mode: "create" }}
        services={services}
      />
    </>
  );
}

export function NewBarberCard({
  disabled,
  services,
}: {
  disabled?: boolean;
  services: ServiceOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[color:var(--border)] p-6 text-center transition-colors enabled:hover:border-[color:var(--foreground)] enabled:hover:bg-[color:var(--card)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.97_0.005_80)] text-[color:var(--muted-foreground)] group-enabled:group-hover:bg-[color:var(--foreground)] group-enabled:group-hover:text-[color:var(--background)]">
          <Plus className="h-5 w-5" />
        </span>
        <p className="font-serif text-lg font-semibold">Agregar barbero</p>
        <p className="max-w-xs text-xs text-[color:var(--muted-foreground)]">
          {disabled
            ? "Alcanzaste el límite de tu plan actual. Actualiza para sumar más."
            : "Cada barbero tiene su agenda, servicios y comisiones."}
        </p>
      </button>
      <BarberFormDialog
        open={open}
        onOpenChange={setOpen}
        config={{ mode: "create" }}
        services={services}
      />
    </>
  );
}

export function BarberFormDialog({
  open,
  onOpenChange,
  config,
  services,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: Mode;
  services: ServiceOption[];
}) {
  const action =
    config.mode === "create" ? createBarberAction : updateBarberAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [tone, setTone] = useState<string>(
    config.mode === "edit" ? config.barber.avatarTone : BARBER_TONES[0]
  );

  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    () =>
      new Set(config.mode === "edit" ? config.assignedServiceIds : [])
  );

  const grouped = useMemo(() => {
    const map: Record<string, ServiceOption[]> = {};
    for (const s of services) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    return map;
  }, [services]);

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (state.ok) {
      toast.success(
        config.mode === "create" ? "Barbero agregado" : "Cambios guardados"
      );
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, config.mode, onOpenChange]);

  const defaults =
    config.mode === "edit"
      ? config.barber
      : { name: "", role: "Barbero", phone: "" };

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {config.mode === "create" ? "Nuevo barbero" : "Editar barbero"}
          </DialogTitle>
          <DialogDescription>
            Esta información aparece en tu página pública y en la agenda.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {config.mode === "edit" ? (
            <input type="hidden" name="id" value={config.barber.id} />
          ) : null}
          <input type="hidden" name="avatarTone" value={tone} />
          <input
            type="hidden"
            name="serviceIds"
            value={JSON.stringify(Array.from(selectedServices))}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name}
              placeholder="Tony Méndez"
              required
              disabled={isPending}
              aria-invalid={!!fieldError("name")}
            />
            {fieldError("name") && (
              <p className="text-xs text-[oklch(0.45_0.18_25)]">
                {fieldError("name")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                name="role"
                defaultValue={defaults.role}
                placeholder="Barbero"
                disabled={isPending}
                aria-invalid={!!fieldError("role")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaults.phone ?? ""}
                placeholder="+52 662..."
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color del avatar</Label>
            <div className="flex flex-wrap gap-2">
              {BARBER_TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  disabled={isPending}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    tone === t
                      ? "scale-110 border-[color:var(--foreground)]"
                      : "border-[color:var(--border)] hover:scale-105"
                  }`}
                  style={{ background: t }}
                  aria-label={`Elegir color ${t}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" />
              Servicios que realiza
            </Label>
            <div className="max-h-48 overflow-y-auto rounded-md border border-[color:var(--border)] bg-[color:var(--background)] p-2">
              {Object.entries(CATEGORY_LABEL).map(([cat, label]) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                return (
                  <div key={cat} className="mb-2 last:mb-0">
                    <p className="px-1 py-0.5 text-[10px] font-semibold uppercase text-[color:var(--muted-foreground)]">
                      {label}
                    </p>
                    {items.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[oklch(0.97_0.005_80)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.has(s.id)}
                          onChange={() => toggleService(s.id)}
                          disabled={isPending}
                          className="h-4 w-4 rounded border-[color:var(--border)] accent-[oklch(0.45_0.15_25)]"
                        />
                        <span className="flex-1 truncate">{s.name}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
              {Object.keys(grouped).length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-[color:var(--muted-foreground)]">
                  No hay servicios aún. Créalos en la sección de Servicios.
                </p>
              )}
            </div>
          </div>

          <WorkingHoursEditor
            defaultValue={
              config.mode === "edit" && config.barber.workingHours
                ? (config.barber.workingHours as WorkingHours)
                : DEFAULT_WORKING_HOURS
            }
            disabled={isPending}
          />

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
              {isPending
                ? "Guardando..."
                : config.mode === "create"
                  ? "Agregar barbero"
                  : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
