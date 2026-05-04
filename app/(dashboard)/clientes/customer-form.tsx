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
  createCustomerAction,
  updateCustomerAction,
  type CustomerActionState,
} from "./actions";
import { CUSTOMER_TAGS } from "@/lib/validation/customer";
import type { Customer } from "@/lib/db/schema";

const initialState: CustomerActionState = {};
const NO_TAG = "__none__";

type EditableCustomer = Pick<
  Customer,
  "id" | "name" | "phone" | "email" | "notes" | "tag"
>;

type Mode = { mode: "create" } | { mode: "edit"; customer: EditableCustomer };

export function NewCustomerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="shadow-sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        Nuevo cliente
      </Button>
      <CustomerFormDialog
        open={open}
        onOpenChange={setOpen}
        config={{ mode: "create" }}
      />
    </>
  );
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  config,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: Mode;
}) {
  const action =
    config.mode === "create" ? createCustomerAction : updateCustomerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [tag, setTag] = useState<string>(
    config.mode === "edit" ? (config.customer.tag ?? NO_TAG) : NO_TAG
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(
        config.mode === "create" ? "Cliente agregado" : "Cambios guardados"
      );
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, config.mode, onOpenChange]);

  const defaults =
    config.mode === "edit"
      ? config.customer
      : { name: "", phone: "", email: "", notes: "" };

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {config.mode === "create" ? "Nuevo cliente" : "Editar cliente"}
          </DialogTitle>
          <DialogDescription>
            Los clientes se agregan automáticamente al crear una cita. También
            puedes registrarlos manualmente.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {config.mode === "edit" ? (
            <input type="hidden" name="id" value={config.customer.id} />
          ) : null}
          <input
            type="hidden"
            name="tag"
            value={tag === NO_TAG ? "" : tag}
          />

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name}
              placeholder="Luis Ramírez"
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
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaults.phone}
                placeholder="+52 662..."
                required
                disabled={isPending}
                aria-invalid={!!fieldError("phone")}
              />
              {fieldError("phone") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("phone")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaults.email ?? ""}
                placeholder="Opcional"
                disabled={isPending}
                aria-invalid={!!fieldError("email")}
              />
              {fieldError("email") && (
                <p className="text-xs text-[oklch(0.45_0.18_25)]">
                  {fieldError("email")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Segmento</Label>
            <Select value={tag} onValueChange={setTag} disabled={isPending}>
              <SelectTrigger id="tag">
                <SelectValue placeholder="Sin segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TAG}>Sin segmento</SelectItem>
                {CUSTOMER_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={defaults.notes ?? ""}
              rows={3}
              placeholder="Preferencias, alergias, etc."
              disabled={isPending}
              className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:opacity-50"
            />
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
                  ? "Agregar cliente"
                  : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
