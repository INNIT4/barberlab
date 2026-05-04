"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DAYS,
  type DayKey,
  type DaySchedule,
  type WorkingHours,
} from "@/lib/data/working-hours";

type FieldErrors = Partial<Record<DayKey, string>>;

export function WorkingHoursEditor({
  name = "workingHours",
  defaultValue,
  disabled,
}: {
  name?: string;
  defaultValue: WorkingHours;
  disabled?: boolean;
}) {
  const [hours, setHours] = useState<WorkingHours>(defaultValue);

  const fieldErrors = useMemo<FieldErrors>(() => {
    const errs: FieldErrors = {};
    for (const { key } of DAYS) {
      const s = hours[key];
      if (s && s.start >= s.end) errs[key] = "Fin antes que inicio";
    }
    return errs;
  }, [hours]);

  function toggle(day: DayKey, open: boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: open ? (prev[day] ?? { start: "10:00", end: "20:00" }) : null,
    }));
  }

  function setTime(day: DayKey, which: "start" | "end", value: string) {
    setHours((prev) => {
      const current: DaySchedule = prev[day] ?? { start: "10:00", end: "20:00" };
      return { ...prev, [day]: { ...current, [which]: value } };
    });
  }

  return (
    <div className="space-y-2">
      <Label>Horarios de trabajo</Label>
      <p className="text-xs text-[color:var(--muted-foreground)]">
        Define qué días y a qué hora atiende este barbero. Los clientes solo
        podrán reservar dentro de este rango.
      </p>

      <div className="overflow-hidden rounded-lg border border-[color:var(--border)]">
        {DAYS.map(({ key, label }, i) => {
          const schedule = hours[key];
          const open = schedule !== null;
          const err = fieldErrors[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-3 py-2.5 ${
                i > 0 ? "border-t border-[color:var(--border)]" : ""
              }`}
            >
              <div className="flex w-28 items-center gap-2">
                <Switch
                  checked={open}
                  disabled={disabled}
                  onCheckedChange={(v) => toggle(key, v)}
                  aria-label={`Abierto ${label}`}
                />
                <span className="text-sm font-medium">{label}</span>
              </div>

              {open && schedule ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={schedule.start}
                    disabled={disabled}
                    onChange={(e) => setTime(key, "start", e.target.value)}
                    className="h-8 flex-1 rounded-md border border-[color:var(--border)] bg-transparent px-2 text-sm"
                  />
                  <span className="text-xs text-[color:var(--muted-foreground)]">
                    a
                  </span>
                  <input
                    type="time"
                    value={schedule.end}
                    disabled={disabled}
                    onChange={(e) => setTime(key, "end", e.target.value)}
                    className="h-8 flex-1 rounded-md border border-[color:var(--border)] bg-transparent px-2 text-sm"
                  />
                  {err ? (
                    <span className="text-[11px] text-[oklch(0.45_0.18_25)]">
                      {err}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="flex-1 text-xs italic text-[color:var(--muted-foreground)]">
                  Cerrado
                </span>
              )}
            </div>
          );
        })}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(hours)} />
    </div>
  );
}
