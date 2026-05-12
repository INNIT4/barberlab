"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mxnCurrency } from "@/lib/formatters";
import type { DayViewAppointment } from "./day-view";

type ListViewProps = {
  date: string;
  appointments: DayViewAppointment[];
  barbers: { id: string; name: string; avatarTone: string }[];
  timezone: string;
  onSelectAppointment: (apt: DayViewAppointment) => void;
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  confirmada: {
    label: "Confirmada",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  completada: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

function groupByDate(
  appointments: DayViewAppointment[],
  timezone: string
): Record<string, DayViewAppointment[]> {
  const groups: Record<string, DayViewAppointment[]> = {};
  for (const apt of appointments) {
    const key = formatInTimeZone(new Date(apt.startsAt), timezone, "yyyy-MM-dd");
    const list = groups[key] ?? [];
    list.push(apt);
    groups[key] = list;
  }
  return groups;
}

export function ListView({
  date,
  appointments,
  barbers,
  timezone,
  onSelectAppointment,
}: ListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const d = addDays(fromZonedTime(`${date} 00:00:00`, timezone), days);
    params.set("day", formatInTimeZone(d, timezone, "yyyy-MM-dd"));
    params.set("view", "list");
    router.push(`/agenda?${params.toString()}`);
  };

  const goToday = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("day");
    params.set("view", "list");
    router.push(`/agenda?${params.toString()}`);
  };

  const dayLabel = formatInTimeZone(
    fromZonedTime(`${date} 00:00:00`, timezone),
    timezone,
    "EEEE d 'de' MMMM"
  );

  const grouped = groupByDate(appointments, timezone);
  const dateKeys = Object.keys(grouped).sort();
  const filteredKeys = dateKeys.length > 0 ? dateKeys : [date];

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(-7)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-serif text-lg font-semibold capitalize">
            Semana del {dayLabel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(7)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 text-xs"
            onClick={goToday}
          >
            Hoy
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {barbers.map((b) => (
            <Badge
              key={b.id}
              variant="outline"
              className="gap-2 border-[color:var(--border)] py-1"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: b.avatarTone }}
              />
              {b.name.split(" ")[0]}
            </Badge>
          ))}
        </div>
      </header>

      {appointments.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No hay citas esta semana.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[color:var(--border)]">
          {filteredKeys.map((dateKey) => {
            const apts = grouped[dateKey] ?? [];
            if (apts.length === 0) return null;
            const dateHeader = formatInTimeZone(
              fromZonedTime(`${dateKey} 00:00:00`, timezone),
              timezone,
              "EEEE d 'de' MMMM"
            );
            return (
              <div key={dateKey}>
                <div className="sticky top-0 z-10 bg-[oklch(0.97_0.01_80)] px-5 py-2">
                  <p className="text-sm font-semibold capitalize">
                    {dateHeader}
                  </p>
                  <p className="text-[10px] text-[color:var(--muted-foreground)]">
                    {apts.length} cita{apts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="divide-y divide-[color:var(--border)]/50">
                  {apts
                    .sort(
                      (a, b) =>
                        new Date(a.startsAt).getTime() -
                        new Date(b.startsAt).getTime()
                    )
                    .map((apt) => {
                      const statusInfo = STATUS_LABEL[apt.status] ?? STATUS_LABEL.confirmada;
                      return (
                        <button
                          key={apt.id}
                          type="button"
                          className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[oklch(0.985_0.01_80)]"
                          onClick={() => onSelectAppointment(apt)}
                        >
                          <div className="w-14 flex-none text-center">
                            <p className="text-sm font-semibold tabular-nums">
                              {formatInTimeZone(
                                new Date(apt.startsAt),
                                timezone,
                                "HH:mm"
                              )}
                            </p>
                            <p className="text-[10px] text-[color:var(--muted-foreground)]">
                              {apt.serviceDuration}min
                            </p>
                          </div>

                          <div
                            className="h-10 w-1 flex-none rounded-full"
                            style={{ background: apt.barberTone }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "truncate text-sm font-medium",
                                  apt.status === "cancelada" && "line-through opacity-50"
                                )}
                              >
                                {apt.customerName}
                              </p>
                              <Badge
                                variant="outline"
                                className={`shrink-0 text-[9px] ${statusInfo.className}`}
                              >
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="truncate text-xs text-[color:var(--muted-foreground)]">
                              {apt.serviceName} · {apt.barberName}
                            </p>
                          </div>

                          <p className="flex-none text-right text-sm font-medium tabular-nums">
                            {mxnCurrency.format(apt.priceMxn)}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
