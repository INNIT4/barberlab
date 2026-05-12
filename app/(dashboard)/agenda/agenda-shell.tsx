"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, Columns3 } from "lucide-react";
import { DayView } from "./day-view";
import type { DayViewAppointment, DayViewBarber } from "./day-view";
import { WeekView } from "./week-view";
import { ListView } from "./list-view";
import { AppointmentDetailSheet } from "./appointment-detail-sheet";

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

type AgendaShellProps = {
  appointments: AppointmentSlot[];
  today: string;
  currentWeekStart: string;
  currentDay: string;
  timezone: string;
  barbers: { id: string; name: string; avatarTone: string }[];
  workingBarbers: DayViewBarber[];
  serviceIdsByBarber: Record<string, string[]>;
  children?: React.ReactNode;
};

export function AgendaShell({
  appointments,
  today,
  currentWeekStart,
  currentDay,
  timezone,
  barbers,
  workingBarbers,
  children,
}: AgendaShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedApt, setSelectedApt] = useState<AppointmentSlot | null>(null);

  const view = searchParams.get("view") ?? "day";

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    if (v !== "week") params.delete("week");
    router.push(`/agenda?${params.toString()}`);
  }

  const dayAppointments: DayViewAppointment[] = appointments.map((a) => ({
    id: a.id,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    status: a.status,
    priceMxn: a.priceMxn,
    barberId: "",
    barberName: a.barberName,
    barberTone: a.barberTone,
    serviceName: a.serviceName,
    serviceDuration: a.serviceDuration,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
  }));

  return (
    <>
      {children}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
          <Tabs
            value={view}
            onValueChange={setView}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="day">
                <Columns3 className="h-3.5 w-3.5" />
                Día
              </TabsTrigger>
              <TabsTrigger value="week">
                <CalendarDays className="h-3.5 w-3.5" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-3.5 w-3.5" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            {view === "day" && (
              <DayView
                date={currentDay}
                appointments={dayAppointments}
                barbers={workingBarbers}
                timezone={timezone}
                onSelectAppointment={setSelectedApt}
              />
            )}
            {view === "week" && (
              <WeekView
                appointments={appointments}
                today={today}
                currentWeekStart={currentWeekStart}
                timezone={timezone}
                barbers={barbers}
                onSelectAppointment={setSelectedApt}
              />
            )}
            {view === "list" && (
              <ListView
                date={currentDay}
                appointments={dayAppointments}
                barbers={barbers}
                timezone={timezone}
                onSelectAppointment={setSelectedApt}
              />
            )}
          </div>
        </div>
      </div>

      <AppointmentDetailSheet
        appointment={selectedApt}
        open={selectedApt !== null}
        onOpenChange={(v) => {
          if (!v) setSelectedApt(null);
        }}
        timezone={timezone}
      />
    </>
  );
}
