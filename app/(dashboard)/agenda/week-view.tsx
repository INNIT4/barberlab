"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AppointmentSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceMxn: number;
  barberName: string;
  barberTone: string;
  serviceName: string;
  serviceDuration: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

type WeekViewProps = {
  appointments: AppointmentSlot[];
  today: string;
  currentWeekStart: string;
  timezone: string;
  barbers: { id: string; name: string; avatarTone: string }[];
  onSelectAppointment?: (apt: AppointmentSlot) => void;
};

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const STATUS_COLORS: Record<string, string> = {
  confirmada: "border-l-blue-500",
  pendiente: "border-l-amber-500",
  completada: "border-l-emerald-500",
  cancelada: "border-l-rose-400",
};

function dayLabel(date: Date, tz: string) {
  const month = formatInTimeZone(date, tz, "MMM").replace(".", "");
  const day = formatInTimeZone(date, tz, "d");
  return `${day} ${month}`;
}

export function WeekView({
  appointments,
  today,
  currentWeekStart,
  timezone,
  barbers,
  onSelectAppointment,
}: WeekViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekDate = fromZonedTime(`${currentWeekStart} 00:00:00`, timezone);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekDate, i));

  const prevWeek = formatInTimeZone(addDays(weekDate, -7), timezone, "yyyy-MM-dd");
  const nextWeek = formatInTimeZone(addDays(weekDate, 7), timezone, "yyyy-MM-dd");

  function navigate(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", date);
    params.set("view", "week");
    router.push(`/agenda?${params.toString()}`);
  }

  const aptsByDate: Record<string, AppointmentSlot[]> = {};
  for (const apt of appointments) {
    const dateKey = formatInTimeZone(new Date(apt.startsAt), timezone, "yyyy-MM-dd");
    if (!aptsByDate[dateKey]) aptsByDate[dateKey] = [];
    aptsByDate[dateKey].push(apt);
  }

  const hours = Array.from({ length: 13 }, (_, i) => i + 9);

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(prevWeek)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-serif text-lg font-semibold">
            {dayLabel(days[0], timezone)} – {dayLabel(days[6], timezone)}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(nextWeek)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 text-xs"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("week");
              params.set("view", "week");
              router.push(`/agenda?${params.toString()}`);
            }}
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

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
            <div className="border-b border-r border-[color:var(--border)]" />
            {days.map((date, i) => {
              const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
              const isToday = dateKey === today;
              const dayCount = (aptsByDate[dateKey] ?? []).filter((a) => a.status !== "cancelada").length;
              return (
                <div
                  key={i}
                  className={cn(
                    "border-b border-r border-[color:var(--border)] px-2 py-2 text-center last:border-r-0",
                    isToday && "bg-[oklch(0.96_0.02_240)]"
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    {DAY_NAMES[i]}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-sm font-semibold",
                      isToday && "text-[oklch(0.4_0.1_240)]"
                    )}
                  >
                    {formatInTimeZone(date, timezone, "d")}
                  </p>
                  {dayCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="mt-1 text-[9px]"
                    >
                      {dayCount}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[4rem_repeat(7,1fr)]"
            >
              <div className="border-b border-r border-[color:var(--border)] px-1 py-0.5 text-right text-[10px] leading-none text-[color:var(--muted-foreground)]">
                {String(hour).padStart(2, "0")}:00
              </div>
              {days.map((date, i) => {
                const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
                const slotApts = (aptsByDate[dateKey] ?? []).filter(
                  (a) => a.status !== "cancelada"
                );

                const aptsInSlot = slotApts.filter((a) => {
                  const s = new Date(a.startsAt);
                  return s.getUTCHours() >= hour && s.getUTCHours() < hour + 1;
                });

                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-0.5 border-b border-r border-[color:var(--border)] px-1 py-0.5 last:border-r-0",
                      dateKey === today && "bg-[oklch(0.985_0.008_80)]"
                    )}
                  >
                    {aptsInSlot.map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => onSelectAppointment?.(apt)}
                        className={cn(
                          "w-full rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition hover:brightness-95",
                          apt.status === "cancelada" && "opacity-40 line-through"
                        )}
                        style={{
                          borderLeft: `4px solid ${apt.barberTone}`,
                          background: `${apt.barberTone}18`,
                        }}
                        title={`${apt.customerName} – ${apt.serviceName} (${apt.barberName})`}
                      >
                        <span className="font-semibold tabular-nums text-[10px]">
                          {formatInTimeZone(new Date(apt.startsAt), timezone, "HH:mm")}{" "}
                        </span>
                        <span className="truncate">{apt.customerName}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
            <div className="border-r border-[color:var(--border)] px-1 py-0.5 text-right text-[10px] text-[color:var(--muted-foreground)]">
              21:00
            </div>
            {days.map((_, i) => (
              <div
                key={i}
                className="border-r border-[color:var(--border)] last:border-r-0"
              />
            ))}
          </div>
        </div>
      </div>

      {Object.keys(aptsByDate).length === 0 && (
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No hay citas esta semana.
          </p>
        </div>
      )}
    </section>
  );
}
