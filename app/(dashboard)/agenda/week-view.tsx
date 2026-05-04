"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Scissors } from "lucide-react";
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
};

type WeekViewProps = {
  appointments: AppointmentSlot[];
  today: string;
  currentWeekStart: string;
  timezone: string;
  barbers: { id: string; name: string; avatarTone: string }[];
};

const STATUS_BADGE: Record<string, string> = {
  completada:
    "bg-[oklch(0.94_0.03_155)] text-[oklch(0.38_0.12_150)] ring-[oklch(0.85_0.05_155)]",
  confirmada:
    "bg-[oklch(0.96_0.02_240)] text-[oklch(0.4_0.1_240)] ring-[oklch(0.88_0.03_240)]",
  pendiente:
    "bg-[oklch(0.96_0.04_80)] text-[oklch(0.45_0.12_70)] ring-[oklch(0.88_0.05_80)]",
  cancelada:
    "bg-[oklch(0.96_0.02_25)] text-[oklch(0.5_0.15_25)] ring-[oklch(0.88_0.05_25)]",
};

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

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
                className="inline-block h-2 w-2 rounded-full"
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
                </div>
              );
            })}
          </div>

          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[4rem_repeat(7,1fr)]"
            >
              <div className="border-b border-r border-[color:var(--border)] px-1 py-1.5 text-right text-[10px] text-[color:var(--muted-foreground)]">
                {hour}:00
              </div>
              {days.map((date, i) => {
                const dateKey = formatInTimeZone(date, timezone, "yyyy-MM-dd");
                const slotApts = (aptsByDate[dateKey] ?? []).filter(
                  (a) => a.status !== "cancelada"
                );

                const slotApt = slotApts.find((a) => {
                  const s = new Date(a.startsAt);
                  return s.getUTCHours() >= hour && s.getUTCHours() < hour + 1;
                });

                return (
                  <div
                    key={i}
                    className={cn(
                      "border-b border-r border-[color:var(--border)] px-1 py-0.5 text-[10px] leading-tight last:border-r-0",
                      dateKey === today && "bg-[oklch(0.985_0.008_80)]"
                    )}
                  >
                    {slotApt ? (
                      <div
                        className="rounded px-1 py-0.5 text-[9px] leading-tight"
                        style={{
                          borderLeft: `3px solid ${slotApt.barberTone}`,
                          background: `${slotApt.barberTone}14`,
                        }}
                        title={`${slotApt.customerName} – ${slotApt.serviceName} (${slotApt.barberName})`}
                      >
                        {formatInTimeZone(new Date(slotApt.startsAt), timezone, "HH:mm")}{" "}
                        {slotApt.customerName}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
            <div className="border-r border-[color:var(--border)] px-1 py-1.5 text-right text-[10px] text-[color:var(--muted-foreground)]">
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
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No hay citas esta semana.
          </p>
        </div>
      )}
    </section>
  );
}
