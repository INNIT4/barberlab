"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Plus, Trash2, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  createInvitationAction,
  deleteInvitationAction,
  type InviteActionState,
} from "./invite-actions";
import { useState, useTransition } from "react";

type InvitationInfo = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  token: string;
};

const initialState: InviteActionState = {};

export function InviteStaffSection({
  invitations: initialInvitations,
}: {
  invitations: InvitationInfo[];
}) {
  const [invites, setInvites] = useState(initialInvitations);
  const [state, formAction, isPending] = useActionState(
    createInvitationAction,
    initialState
  );
  const [delPending, startDel] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Invitación creada");
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  function handleDelete(id: string) {
    if (!confirm("¿Cancelar esta invitación?")) return;
    startDel(async () => {
      try {
        await deleteInvitationAction(id);
        setInvites((prev) => prev.filter((i) => i.id !== id));
        toast.success("Invitación cancelada");
      } catch {
        toast.error("Error al cancelar");
      }
    });
  }

  function copyLink(token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const link = `${baseUrl}/signup?invite=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(token);
      toast.success("Enlace copiado");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function expirationText(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / 86400000);
    return days <= 0 ? "Expirada" : `${days} días restantes`;
  }

  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <Mail className="h-5 w-5 text-[color:var(--muted-foreground)]" />
        <h2 className="font-serif text-lg font-semibold">Invitaciones de staff</h2>
      </div>

      <p className="text-xs text-[color:var(--muted-foreground)] mb-4">
        Invita a barberos o administradores a tu barbería. Ellos crean su cuenta y se vinculan automáticamente.
      </p>

      {invites.length > 0 && (
        <div className="mb-4 space-y-2">
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{inv.email}</p>
                <p className="flex items-center gap-1 text-[10px] text-[color:var(--muted-foreground)]">
                  <Clock className="h-3 w-3" />
                  {expirationText(inv.expiresAt)}
                  {inv.role === "staff" ? " · Staff" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyLink(inv.token)}
                  title="Copiar enlace"
                >
                  {copied === inv.token ? (
                    <Check className="h-3.5 w-3.5 text-[oklch(0.5_0.15_150)]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[oklch(0.4_0.15_25)]"
                  onClick={() => handleDelete(inv.id)}
                  disabled={delPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="inviteEmail" className="text-xs">
            Email del barbero
          </Label>
          <Input
            id="inviteEmail"
            name="email"
            type="email"
            placeholder="barbero@barberia.com"
            required
            disabled={isPending}
            aria-invalid={!!fieldError("email")}
          />
          {fieldError("email") && (
            <p className="text-xs text-[oklch(0.45_0.18_25)]">
              {fieldError("email")}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="shrink-0"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {isPending ? "Enviando..." : "Invitar"}
        </Button>
      </form>
    </div>
  );
}
