"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createPublicBookingAction,
  type BookingState,
} from "./booking-action";

type ServiceOption = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceMxn: number;
};

type BarberOption = {
  id: string;
  name: string;
  avatarTone: string;
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const initialState: BookingState = {};

export function BookingSection({
  slug,
  services,
  barbers,
  accent,
}: {
  slug: string;
  services: ServiceOption[];
  barbers: BarberOption[];
  accent: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createPublicBookingAction,
    initialState
  );

  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [barberId, setBarberId] = useState<string>(barbers[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (state.ok) {
      toast.success("¡Cita agendada! Te esperamos.");
      setDate("");
      setTime("10:00");
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  const fieldError = (name: string) => state.fieldErrors?.[name];

  const groupedServices: Record<string, ServiceOption[]> = {};
  for (const s of services) {
    if (!groupedServices[s.category]) groupedServices[s.category] = [];
    groupedServices[s.category].push(s);
  }

  const categoryNames: Record<string, string> = {
    Corte: "Cortes",
    Barba: "Barba",
    Combo: "Combos",
    Extras: "Extras",
  };

  return (
    <section id="agendar" className="border-t border-[oklch(0.25_0.02_60)] py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <header className="mb-12 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            Reserva en línea
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Agenda tu cita
          </h2>
          <p className="mt-4 text-[oklch(0.8_0.02_80)]">
            Sin llamadas. Elige servicio, barbero y horario.
          </p>
        </header>

        <form
          action={formAction}
          className="space-y-6 rounded-2xl border border-[oklch(0.25_0.02_60)] bg-[oklch(0.18_0.01_60)] p-6 sm:p-8"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="barberId" value={barberId} />
          <input type="hidden" name="serviceId" value={serviceId} />

          <div className="space-y-3">
            <Label className="text-sm text-[oklch(0.85_0.02_80)]">Servicio</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(groupedServices).map(([cat, list]) => (
                <div key={cat} className="space-y-1">
                  <p className="pl-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.7_0.04_60)]">
                    {categoryNames[cat] ?? cat}
                  </p>
                  {list.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        serviceId === s.id
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                          : "border-[oklch(0.28_0.02_60)] hover:border-[oklch(0.4_0.05_60)]"
                      }`}
                      style={
                        serviceId === s.id
                          ? {
                              borderColor: accent,
                              backgroundColor: `${accent}18`,
                            }
                          : undefined
                      }
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-2 text-xs text-[oklch(0.75_0.03_60)]">
                        {s.durationMinutes}min · {fmt.format(s.priceMxn)}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-[oklch(0.85_0.02_80)]">Barbero</Label>
            <div className="flex flex-wrap gap-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBarberId(b.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                    barberId === b.id
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                      : "border-[oklch(0.28_0.02_60)] hover:border-[oklch(0.4_0.05_60)]"
                  }`}
                  style={
                    barberId === b.id
                      ? {
                          borderColor: accent,
                          backgroundColor: `${accent}18`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: b.avatarTone }}
                  />
                  {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
            {fieldError("barberId") && (
              <p className="text-xs text-[oklch(0.7_0.12_25)]">
                {fieldError("barberId")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1.5 text-sm text-[oklch(0.85_0.02_80)]">
                <CalendarDays className="h-3.5 w-3.5" />
                Fecha
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isPending}
                className="bg-[oklch(0.22_0.02_60)] border-[oklch(0.28_0.02_60)]"
                aria-invalid={!!fieldError("date")}
              />
              {fieldError("date") && (
                <p className="text-xs text-[oklch(0.7_0.12_25)]">
                  {fieldError("date")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-1.5 text-sm text-[oklch(0.85_0.02_80)]">
                <Clock className="h-3.5 w-3.5" />
                Hora
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={isPending}
                className="bg-[oklch(0.22_0.02_60)] border-[oklch(0.28_0.02_60)]"
                aria-invalid={!!fieldError("time")}
              />
              {fieldError("time") && (
                <p className="text-xs text-[oklch(0.7_0.12_25)]">
                  {fieldError("time")}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm text-[oklch(0.85_0.02_80)]">
                Tu nombre
              </Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Luis Ramírez"
                required
                disabled={isPending}
                className="bg-[oklch(0.22_0.02_60)] border-[oklch(0.28_0.02_60)]"
                aria-invalid={!!fieldError("customerName")}
              />
              {fieldError("customerName") && (
                <p className="text-xs text-[oklch(0.7_0.12_25)]">
                  {fieldError("customerName")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-sm text-[oklch(0.85_0.02_80)]">
                WhatsApp
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="+52 662..."
                required
                disabled={isPending}
                className="bg-[oklch(0.22_0.02_60)] border-[oklch(0.28_0.02_60)]"
                aria-invalid={!!fieldError("customerPhone")}
              />
              {fieldError("customerPhone") && (
                <p className="text-xs text-[oklch(0.7_0.12_25)]">
                  {fieldError("customerPhone")}
                </p>
              )}
            </div>
          </div>

          {selectedService && (
            <p className="text-center text-sm text-[oklch(0.75_0.03_60)]">
              {selectedService.durationMinutes} min · {fmt.format(selectedService.priceMxn)}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
            style={{ background: accent, color: "oklch(0.15 0.01 60)" }}
          >
            {isPending ? (
              "Creando cita..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar reserva
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
