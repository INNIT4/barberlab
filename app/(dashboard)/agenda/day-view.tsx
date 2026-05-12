"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dayKeyFromDate, type WorkingHours } from "@/lib/data/working-hours";
import { rescheduleAppointmentAction } from "./actions";
import { toast } from "sonner";

export type DayViewAppointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  priceMxn: number;
  barberId: string;
  barberName: string;
  barberTone: string;
  serviceName: string;
  serviceDuration: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
};

export type DayViewBarber = {
  id: string;
  name: string;
  avatarTone: string;
  workingHours: WorkingHours | null;
};

type DayViewProps = {
  date: string;
  appointments: DayViewAppointment[];
  barbers: DayViewBarber[];
  timezone: string;
  onSelectAppointment: (apt: DayViewAppointment) => void;
};

const PX_PER_HOUR = 80;
const PX_PER_SLOT = 40;
const MIN_SLOT = 30;

const STATUS_BORDER: Record<string, string> = {
  confirmada: "border-l-blue-500",
  pendiente: "border-l-amber-500",
  completada: "border-l-emerald-500",
  cancelada: "border-l-rose-400 line-through opacity-60",
};

function DraggableAppointment({
  apt,
  top,
  height,
  timezone,
  onClick,
}: {
  apt: DayViewAppointment;
  top: number;
  height: number;
  timezone: string;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: apt.id, data: apt });

  const style = transform
    ? {
        top,
        height,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 30,
        opacity: 0.8,
      }
    : { top, height };

  const borderClass = STATUS_BORDER[apt.status] ?? STATUS_BORDER.confirmada;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onClick();
      }}
      className={cn(
        "absolute left-0.5 right-0.5 cursor-grab overflow-hidden rounded-md border-l-4 bg-white px-1.5 py-0.5 text-[12px] leading-tight shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        borderClass,
        apt.status === "cancelada" && "line-through opacity-50"
      )}
      title={`${apt.customerName} – ${apt.serviceName} (${apt.barberName})`}
    >
      <p className="truncate font-semibold">{apt.customerName}</p>
      <p className="truncate text-[10px] text-[color:var(--muted-foreground)]">
        {apt.serviceName}
      </p>
      <p className="truncate text-[10px] text-[color:var(--muted-foreground)]">
        {formatInTimeZone(new Date(apt.startsAt), timezone, "HH:mm")}
      </p>
    </div>
  );
}

export function DayView({
  date,
  appointments,
  barbers,
  timezone,
  onSelectAppointment,
}: DayViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeApt, setActiveApt] = useState<DayViewAppointment | null>(null);
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef<HTMLDivElement>(null);

  const { dayStartHour, dayEndHour, workingBarbers, closedBarbers } =
    useMemo(() => {
      const dayDate = fromZonedTime(`${date} 00:00:00`, timezone);
      const dayKey = dayKeyFromDate(dayDate);

      let earliest = 24;
      let latest = 0;
      const working: DayViewBarber[] = [];
      const closed: DayViewBarber[] = [];

      for (const b of barbers) {
        const wh = b.workingHours ?? ({} as WorkingHours);
        const sched = wh[dayKey];
        if (!sched) {
          closed.push(b);
          continue;
        }
        working.push(b);
        const [sh] = sched.start.split(":").map(Number);
        const [eh] = sched.end.split(":").map(Number);
        if (sh < earliest) earliest = sh;
        if (eh > latest) latest = eh;
      }

      if (earliest === 24) earliest = 9;
      if (latest === 0) latest = 21;

      return { dayStartHour: earliest, dayEndHour: latest, workingBarbers: working, closedBarbers: closed };
    }, [date, barbers, timezone]);

  const totalHours = dayEndHour - dayStartHour;
  const totalPx = totalHours * PX_PER_HOUR;
  const slots = Array.from({ length: totalHours * 2 }, (_, i) => {
    const minutes = dayStartHour * 60 + i * MIN_SLOT;
    return minutes;
  });

  const aptsByBarber = useMemo(() => {
    const map: Record<string, DayViewAppointment[]> = {};
    for (const apt of appointments) {
      const list = map[apt.barberId] ?? [];
      list.push(apt);
      map[apt.barberId] = list;
    }
    return map;
  }, [appointments]);

  const aptMap = useMemo(() => {
    const map = new Map<string, DayViewAppointment>();
    for (const apt of appointments) map.set(apt.id, apt);
    return map;
  }, [appointments]);

  const navigate = useCallback(
    (days: number) => {
      const params = new URLSearchParams(searchParams.toString());
      const d = addDays(fromZonedTime(`${date} 00:00:00`, timezone), days);
      params.set("day", formatInTimeZone(d, timezone, "yyyy-MM-dd"));
      params.set("view", "day");
      router.push(`/agenda?${params.toString()}`);
    },
    [date, timezone, searchParams, router]
  );

  const goToday = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("day");
    params.set("view", "day");
    router.push(`/agenda?${params.toString()}`);
  }, [searchParams, router]);

  const dayLabel = formatInTimeZone(
    fromZonedTime(`${date} 00:00:00`, timezone),
    timezone,
    "EEEE d 'de' MMMM"
  );

  function handleDragStart(event: DragStartEvent) {
    const apt = aptMap.get(String(event.active.id));
    if (apt) setActiveApt(apt);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveApt(null);
    const { active, delta } = event;
    const apt = aptMap.get(String(active.id));
    if (!apt) return;

    const columnWidth =
      (gridRef.current?.offsetWidth ?? 800) / Math.max(workingBarbers.length, 1);

    const deltaSlots = Math.round(delta.y / PX_PER_SLOT);
    const deltaMinutes = deltaSlots * MIN_SLOT;
    const clampedMinutes = Math.round(deltaMinutes / 15) * 15;

    const newBarberIdx = Math.round(delta.x / columnWidth);
    const currentIdx = workingBarbers.findIndex((b) => b.id === apt.barberId);
    const targetIdx = Math.max(0, Math.min(workingBarbers.length - 1, currentIdx + newBarberIdx));
    const targetBarber = workingBarbers[targetIdx];
    if (!targetBarber) return;

    const startsAtLocal = fromZonedTime(
      formatInTimeZone(new Date(apt.startsAt), timezone, "yyyy-MM-dd HH:mm:ss"),
      timezone
    );
    const newDate = new Date(startsAtLocal.getTime() + clampedMinutes * 60_000);
    const newDateStr = formatInTimeZone(newDate, timezone, "yyyy-MM-dd");
    const newTimeStr = formatInTimeZone(newDate, timezone, "HH:mm");

    if (
      newDateStr ===
        formatInTimeZone(new Date(apt.startsAt), timezone, "yyyy-MM-dd") &&
      newTimeStr ===
        formatInTimeZone(new Date(apt.startsAt), timezone, "HH:mm") &&
      targetBarber.id === apt.barberId
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await rescheduleAppointmentAction({
          id: apt.id,
          barberId: targetBarber.id,
          date: newDateStr,
          time: newTimeStr,
        });
        if (!result.ok) {
          toast.error(result.error ?? "No se pudo reagendar");
        } else {
          toast.success("Cita reagendada");
        }
      } catch {
        toast.error("No se pudo reagendar");
      }
    });
  }

  function calcTop(apt: DayViewAppointment) {
    const localDate = toZonedTime(new Date(apt.startsAt), timezone);
    const minutes = localDate.getHours() * 60 + localDate.getMinutes();
    return ((minutes - dayStartHour * 60) / 60) * PX_PER_HOUR;
  }

  function calcHeight(apt: DayViewAppointment) {
    const s = new Date(apt.startsAt);
    const e = new Date(apt.endsAt);
    const mins = (e.getTime() - s.getTime()) / 60_000;
    return Math.max((mins / 60) * PX_PER_HOUR, 20);
  }

  const nowMinutes = useMemo(() => {
    const local = toZonedTime(new Date(), timezone);
    const dateLocal = formatInTimeZone(local, timezone, "yyyy-MM-dd");
    if (dateLocal !== date) return null;
    return local.getHours() * 60 + local.getMinutes();
  }, [date, timezone]);

  const nowTop =
    nowMinutes != null
      ? ((nowMinutes - dayStartHour * 60) / 60) * PX_PER_HOUR
      : null;

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-serif text-lg font-semibold capitalize">
            {dayLabel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(1)}
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
          {workingBarbers.map((b) => (
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

      {workingBarbers.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            No hay barberos que trabajen este día.
          </p>
          {closedBarbers.length > 0 && (
            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
              Descansan: {closedBarbers.map((b) => b.name.split(" ")[0]).join(", ")}
            </p>
          )}
        </div>
      ) : (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="overflow-auto">
            <div
              ref={gridRef}
              className="relative flex min-w-[600px]"
              style={{ height: totalPx + PX_PER_HOUR }}
            >
              {/* Time gutter */}
              <div className="sticky left-0 z-10 w-14 flex-none bg-[color:var(--card)]">
                <div style={{ height: PX_PER_HOUR / 2 }} />
                {slots.map((minutes) => (
                  <div
                    key={minutes}
                    className="relative flex items-start justify-end pr-2"
                    style={{ height: PX_PER_SLOT }}
                  >
                    <span className="text-[10px] leading-none text-[color:var(--muted-foreground)]">
                      {String(Math.floor(minutes / 60)).padStart(2, "0")}:
                      {String(minutes % 60).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Barber columns */}
              {workingBarbers.map((barber) => (
                <div
                  key={barber.id}
                  className="relative flex-1 border-l border-[color:var(--border)]"
                  style={{ minWidth: 140 }}
                >
                  {/* Horizontal slot lines */}
                  {slots.map((minutes) => (
                    <div
                      key={minutes}
                      className="border-t border-dashed border-[color:var(--border)]/30"
                      style={{ height: PX_PER_SLOT }}
                    />
                  ))}

                  {/* Appointments */}
                  {(aptsByBarber[barber.id] ?? [])
                    .filter((a) => a.status !== "cancelada")
                    .map((apt) => (
                      <DraggableAppointment
                        key={apt.id}
                        apt={apt}
                        top={calcTop(apt)}
                        height={calcHeight(apt)}
                        timezone={timezone}
                        onClick={() => onSelectAppointment(apt)}
                      />
                    ))}

                  {/* Now indicator */}
                  {nowTop != null && nowTop >= -2 && nowTop <= totalPx + 2 && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-20 border-t-2 border-red-500"
                      style={{ top: nowTop }}
                    >
                      <span className="absolute -left-1 -top-2 h-3 w-3 rounded-full bg-red-500" />
                    </div>
                  )}
                </div>
              ))}

              {/* Now indicator line across time gutter */}
              {nowTop != null && nowTop >= -2 && nowTop <= totalPx + 2 && (
                <div
                  className="pointer-events-none absolute left-0 right-0 z-20 border-t-2 border-red-500"
                  style={{ top: nowTop }}
                />
              )}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeApt ? (
              <div
                className="rounded-md border-l-4 border-l-blue-500 bg-white px-2 py-1 text-[12px] leading-tight shadow-lg opacity-90"
                style={{
                  width: `${Math.max(100 / workingBarbers.length, 15)}%`,
                }}
              >
                <p className="truncate font-semibold">{activeApt.customerName}</p>
                <p className="truncate text-[10px] text-[color:var(--muted-foreground)]">
                  {activeApt.serviceName}
                </p>
              </div>
            ) : null}
          </DragOverlay>

          {appointments.filter((a) => a.status !== "cancelada").length ===
            0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                No hay citas para este día.
              </p>
            </div>
          )}
        </DndContext>
      )}
    </section>
  );
}
