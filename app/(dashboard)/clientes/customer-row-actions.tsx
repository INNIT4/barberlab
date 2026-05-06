"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerFormDialog } from "./customer-form";
import { deleteCustomerAction } from "./actions";
import type { Customer } from "@/lib/db/schema";

export function CustomerRowActions({
  customer,
  showTags = false,
}: {
  customer: Pick<Customer, "id" | "name" | "phone" | "email" | "notes" | "tag">;
  showTags?: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar a ${customer.name}? Las citas pasadas quedarán sin cliente.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteCustomerAction(customer.id);
        toast.success("Cliente eliminado");
      } catch {
        toast.error("No se pudo eliminar");
      }
    });
  }

  const whatsappHref = `https://wa.me/${customer.phone.replace(/\D/g, "")}`;

  return (
    <>
      <div className="flex items-center gap-1">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-1 text-[color:var(--muted-foreground)] hover:bg-[oklch(0.97_0.005_80)] hover:text-[oklch(0.4_0.15_150)]"
          aria-label="Enviar WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
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
      </div>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        config={{ mode: "edit", customer }}
        showTags={showTags}
      />
    </>
  );
}
