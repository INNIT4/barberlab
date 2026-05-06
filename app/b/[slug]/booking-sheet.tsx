"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import { Clock, User, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPublicBookingAction,
  type BookingState,
} from "./booking-action";
import { getAvailableSlotsAction } from "./availability-action";
import { DayPicker, type Day } from "./day-picker";
import { SlotGrid } from "./slot-grid";

export type SheetService = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceMxn: number;
  imageUrl: string | null;
};

export type SheetBarber = {
  id: string;
  name: string;
  avatarTone: string;
  workingHoursAvailable: boolean;
};

const fmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const initialState: BookingState = {};
const DAYS_TO_SHOW = 14;

function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDays(barberAvailable: boolean): Day[] {
  const out: Day[] = [];
  const base = new Date();
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    out.push({ iso: `${y}-${m}-${day}`, available: barberAvailable });
  }
  return out;
}

export function BookingSheet({
  slug,
  service,
  barbers,
  accent,
  open,
  onOpenChange,
}: {
  slug: string;
  service: SheetService | null;
  barbers: SheetBarber[];
  accent: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [barberId, setBarberId] = useState<string>(barbers[0]?.id ?? "");
  const [date, setDate] = useState<string>(todayLocalIso());
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, startSlotsTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    createPublicBookingAction,
    initialState
  );

  const selectedBarber = barbers.find((b) => b.id === barberId) ?? barbers[0];
  const days = useMemo(
    () => buildDays(selectedBarber?.workingHoursAvailable ?? false),
    [selectedBarber]
  );

  // Reset state when the sheet opens or service changes
  useEffect(() => {
    if (open) {
      setBarberId(barbers[0]?.id ?? "");
      setDate(todayLocalIso());
      setTime(null);
      setSlots([]);
    }
  }, [open, service?.id, barbers]);

  // Fetch slots whenever service / barber / date change
  useEffect(() => {
    if (!open || !service || !barberId || !date) return;
    setTime(null);
    startSlotsTransition(async () => {
      const result = await getAvailableSlotsAction({
        slug,
        serviceId: service.id,
        barberId,
        date,
      });
      if (result.ok) {
        setSlots(result.slots);
      } else {
        setSlots([]);
        toast.error(result.error);
      }
    });
  }, [open, service, barberId, date, slug]);

  // React to form submit result
  useEffect(() => {
    if (state.ok) {
      toast.success("¡Cita agendada! Te esperamos.");
      onOpenChange(false);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  const fieldError = (n: string) => state.fieldErrors?.[n];

  if (!service) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto bg-[color:var(--paper)] p-0 text-[color:var(--ink)] sm:max-w-md"
      >
        <SheetHeader className="border-b border-[color:var(--ink)]/10 p-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--paper-deep)]">
            {service.imageUrl ? (
              <Image
                src={service.imageUrl}
                alt={service.name}
                fill
                sizes="500px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[color:var(--ink)]/30">
                <span className="font-serif text-3xl">{service.name[0]}</span>
              </div>
            )}
            <span
              className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--paper)]"
              style={{ background: accent }}
            >
              {service.category}
            </span>
          </div>
          <div className="space-y-2 px-5 py-4">
            <SheetTitle className="font-serif text-2xl text-[color:var(--ink)]">
              {service.name}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-3 text-sm text-[color:var(--ink)]/70">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service.durationMinutes} min
              </span>
              <span className="opacity-30">·</span>
              <span
                className="font-serif text-lg font-semibold"
                style={{ color: accent }}
              >
                {fmt.format(service.priceMxn)}
              </span>
            </SheetDescription>
          </div>
        </SheetHeader>

        <form action={formAction} className="flex flex-col gap-6 p-5">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="barberId" value={barberId} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="time" value={time ?? ""} />

          {/* Barbero */}
          {barbers.length > 1 ? (
            <section className="space-y-2">
              <p className="stamp text-[color:var(--oxblood)]">Barbero</p>
              <div className="flex flex-wrap gap-2">
                {barbers.map((b) => {
                  const isSel = b.id === barberId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBarberId(b.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        isSel
                          ? "border-transparent text-[color:var(--paper)]"
                          : "border-[color:var(--ink)]/15 hover:border-[color:var(--ink)]/40"
                      }`}
                      style={isSel ? { background: accent } : undefined}
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: b.avatarTone }}
                      />
                      {b.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Día */}
          <section className="space-y-2">
            <p className="stamp text-[color:var(--oxblood)]">Elige el día</p>
            <DayPicker
              days={days}
              selectedIso={date}
              onSelect={setDate}
              accent={accent}
            />
          </section>

          {/* Slots */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="stamp text-[color:var(--oxblood)]">Hora libre</p>
              {isLoadingSlots ? (
                <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted-foreground)]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  cargando…
                </span>
              ) : null}
            </div>
            <SlotGrid
              slots={slots}
              selectedTime={time}
              onSelect={setTime}
              accent={accent}
              loading={isLoadingSlots}
            />
            {fieldError("time") ? (
              <p className="text-xs text-[oklch(0.45_0.18_25)]">
                {fieldError("time")}
              </p>
            ) : null}
          </section>

          {/* Datos del cliente — solo cuando hay slot */}
          {time ? (
            <section className="space-y-3 rounded-xl border border-[color:var(--ink)]/10 bg-[color:var(--paper-deep)]/40 p-4">
              <p className="stamp text-[color:var(--oxblood)]">Tus datos</p>
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-xs">
                  <User className="mr-1 inline h-3 w-3" />
                  Nombre
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Luis Ramírez"
                  required
                  disabled={isPending}
                  aria-invalid={!!fieldError("customerName")}
                />
                {fieldError("customerName") ? (
                  <p className="text-xs text-[oklch(0.45_0.18_25)]">
                    {fieldError("customerName")}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-xs">
                  WhatsApp
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  placeholder="+52 662 123 4567"
                  required
                  disabled={isPending}
                  aria-invalid={!!fieldError("customerPhone")}
                />
                {fieldError("customerPhone") ? (
                  <p className="text-xs text-[oklch(0.45_0.18_25)]">
                    {fieldError("customerPhone")}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={!time || isPending}
            className="w-full"
            style={{ background: accent, color: "var(--paper)" }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reservando…
              </>
            ) : time ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reservar a las {time}
              </>
            ) : (
              "Elige una hora"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
