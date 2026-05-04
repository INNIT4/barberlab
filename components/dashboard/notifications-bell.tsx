"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotifInfo = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsBell({
  notifications: initial,
}: {
  notifications: NotifInfo[];
}) {
  const [open, setOpen] = useState(false);
  const unread = initial.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notificaciones${unread > 0 ? ` (${unread} sin leer)` : ""}`}
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_25)] text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
              <p className="font-serif text-sm font-semibold">Notificaciones</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {initial.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-[color:var(--muted-foreground)]">
                  Sin notificaciones aún. Aquí verás nuevas citas y cambios.
                </p>
              ) : (
                initial.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-[color:var(--border)] px-4 py-3 last:border-b-0 ${n.read ? "" : "bg-[oklch(0.97_0.02_240)]"}`}
                  >
                    <div className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-3.5 w-3.5 ${n.read ? "text-[color:var(--muted-foreground)]" : "text-[oklch(0.45_0.1_240)]"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{n.title}</p>
                        <p className="text-[10px] text-[color:var(--muted-foreground)]">{n.body}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
