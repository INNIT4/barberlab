"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteWalkInAction } from "./actions";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export type WalkInRow = {
  id: string;
  priceMxn: number;
  date: string;
  notes: string | null;
  barberName: string | null;
  serviceName: string | null;
};

export function WalkInList({
  walkIns,
  timezone,
}: {
  walkIns: WalkInRow[];
  timezone: string;
}) {
  if (walkIns.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[color:var(--muted-foreground)]">
        Sin ventas registradas este mes.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[color:var(--border)]">
      {walkIns.map((w) => (
        <li
          key={w.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold tabular-nums">
                {fmt.format(w.priceMxn)}
              </span>
              {w.serviceName && (
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  · {w.serviceName}
                </span>
              )}
              {w.barberName && (
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  · {w.barberName}
                </span>
              )}
            </div>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              {formatDate(w.date, timezone)}
              {w.notes && ` — ${w.notes}`}
            </p>
          </div>
          <form
            action={async () => {
              await deleteWalkInAction(w.id);
              toast.success("Venta eliminada");
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[color:var(--muted-foreground)] hover:text-[oklch(0.45_0.18_25)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string, tz: string) {
  try {
    return formatInTimeZone(new Date(iso), tz, "d MMM · HH:mm");
  } catch {
    return iso;
  }
}
