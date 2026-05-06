"use client";

import { useActionState, useEffect, useState } from "react";
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
  createServiceAction,
  updateServiceAction,
  type ServiceActionState,
} from "./actions";
import { SERVICE_CATEGORIES } from "@/lib/validation/service";
import { ImageUploadField } from "@/components/image-upload-field";
import type { Service } from "@/lib/db/schema";

const initialState: ServiceActionState = {};

type EditableService = Pick<
  Service,
  "id" | "name" | "category" | "durationMinutes" | "priceMxn" | "imageUrl"
>;

type Mode = { mode: "create" } | { mode: "edit"; service: EditableService };

export function NewServiceButton({ orgId }: { orgId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="shadow-sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        Nuevo servicio
      </Button>
      <ServiceFormDialog
        open={open}
        onOpenChange={setOpen}
        orgId={orgId}
        config={{ mode: "create" }}
      />
    </>
  );
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  orgId,
  config,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orgId: string;
  config: Mode;
}) {
  const action =
    config.mode === "create" ? createServiceAction : updateServiceAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [category, setCategory] = useState<string>(
    config.mode === "edit" ? config.service.category : "Corte"
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(
        config.mode === "create" ? "Servicio creado" : "Servicio actualizado"
      );
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, config.mode, onOpenChange]);

  const defaults =
    config.mode === "edit"
      ? config.service
      : { name: "", durationMinutes: 30, priceMxn: 200, imageUrl: null as string | null };

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {config.mode === "create" ? "Nuevo servicio" : "Editar servicio"}
          </DialogTitle>
          <DialogDescription>
            Define nombre, precio, tiempo y una foto. Puedes pausarlo después sin borrarlo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {config.mode === "edit" ? (
            <input type="hidden" name="id" value={config.service.id} />
          ) : null}

          <ImageUploadField
            name="imageUrl"
            label="Foto del servicio"
            orgId={orgId}
            kind="service"
            initialUrl={defaults.imageUrl ?? null}
            aspect="card"
            help="Una foto ayuda al cliente a elegir. Recomendado 4:3, máx 3 MB."
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name}
              placeholder="Corte clásico"
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

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              name="category"
              value={category}
              onValueChange={setCategory}
              disabled={isPending}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duración (min)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min={5}
                step={5}
                defaultValue={defaults.durationMinutes}
                required
                disabled={isPending}
                aria-invalid={!!fieldError("durationMinutes")}
              />
              {fieldError("durationMinutes") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("durationMinutes")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMxn">Precio (MXN)</Label>
              <Input
                id="priceMxn"
                name="priceMxn"
                type="number"
                min={0}
                step={10}
                defaultValue={defaults.priceMxn}
                required
                disabled={isPending}
                aria-invalid={!!fieldError("priceMxn")}
              />
              {fieldError("priceMxn") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("priceMxn")}
                </p>
              )}
            </div>
          </div>

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
                  ? "Crear servicio"
                  : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
