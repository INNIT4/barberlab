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
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createExpenseAction, updateExpenseAction, type ExpenseActionState } from "./actions";
import type { Expense } from "@/lib/db/schema";

const CATEGORIES = ["Productos", "Alquiler", "Servicios", "Salarios", "Marketing", "Otro"] as const;

const initialState: ExpenseActionState = {};

type EditableExpense = Pick<Expense, "id" | "description" | "amountMxn" | "category" | "notes"> & { date: string };

type Mode = { mode: "create" } | { mode: "edit"; expense: EditableExpense };

export function NewExpenseButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="shadow-sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        Agregar gasto
      </Button>
      <ExpenseFormDialog open={open} onOpenChange={setOpen} config={{ mode: "create" }} />
    </>
  );
}

export function EditExpenseButton({ expense }: { expense: EditableExpense }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <ExpenseFormDialog
        open={open}
        onOpenChange={setOpen}
        config={{ mode: "edit", expense }}
      />
    </>
  );
}

export function ExpenseFormDialog({ open, onOpenChange, config }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: Mode;
}) {
  const action = config.mode === "create" ? createExpenseAction : updateExpenseAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [category, setCategory] = useState<string>(
    config.mode === "edit" ? config.expense.category : "Productos"
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(config.mode === "create" ? "Gasto registrado" : "Gasto actualizado");
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, config.mode, onOpenChange]);

  const defaults = config.mode === "edit" ? config.expense : { description: "", amountMxn: "", date: "", notes: "" };
  const fieldError = (n: string) => state.fieldErrors?.[n];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {config.mode === "create" ? "Nuevo gasto" : "Editar gasto"}
          </DialogTitle>
          <DialogDescription>Registra productos, alquiler, salarios y más.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {config.mode === "edit" ? <input type="hidden" name="id" value={config.expense.id} /> : null}
          <input type="hidden" name="category" value={category} />

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              defaultValue={defaults.description}
              placeholder="Shampoo profesional 5L"
              required
              disabled={isPending}
              aria-invalid={!!fieldError("description")}
            />
            {fieldError("description") && <p className="text-xs text-[oklch(0.45_0.18_25)]">{fieldError("description")}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (MXN)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={1}
                step={1}
                defaultValue={typeof defaults.amountMxn === "number" ? String(defaults.amountMxn) : ""}
                placeholder="350"
                required
                disabled={isPending}
                aria-invalid={!!fieldError("amount")}
              />
              {fieldError("amount") && <p className="text-xs text-[oklch(0.45_0.18_25)]">{fieldError("amount")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaults.date || undefined}
                required
                disabled={isPending}
                aria-invalid={!!fieldError("date")}
              />
              {fieldError("date") && <p className="text-xs text-[oklch(0.45_0.18_25)]">{fieldError("date")}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={defaults.notes ?? ""}
              placeholder="Factura, proveedor..."
              disabled={isPending}
              className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/40 disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : config.mode === "create" ? "Registrar gasto" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
