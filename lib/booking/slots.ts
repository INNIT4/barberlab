import { dayKeyFromDate, type WorkingHours } from "@/lib/data/working-hours";

export type Slot = {
  /** "HH:mm" en zona horaria local del negocio */
  time: string;
  /** Inicio del slot en UTC (Date) */
  startsAt: Date;
  /** Fin del slot en UTC (Date) */
  endsAt: Date;
};

/**
 * Tamaño del paso entre slots. Usamos 30 minutos como estándar
 * de la industria (cada slot empieza en :00 o :30).
 */
export const SLOT_STEP_MINUTES = 30;

function parseHm(value: string): { h: number; m: number } {
  const [h, m] = value.split(":").map(Number);
  return { h, m };
}

/**
 * Genera los slots disponibles para un barbero en una fecha local dada.
 *
 * @param dateLocal Fecha del día (en TZ del negocio, sin componente horario relevante).
 *                  Solo se usa para extraer year/month/day y el día de la semana.
 * @param workingHours Horarios del barbero por día.
 * @param serviceDurationMin Duración del servicio (para asegurar que el slot termine antes del cierre).
 * @param toUtc Función que convierte "YYYY-MM-DD HH:mm" local a Date UTC (date-fns-tz fromZonedTime).
 * @param existing Citas existentes del barbero ese día (rangos UTC).
 * @param now Fecha actual UTC (para filtrar slots pasados si es hoy).
 */
export function computeAvailableSlots({
  dateLocal,
  workingHours,
  serviceDurationMin,
  toUtc,
  existing,
  now,
}: {
  dateLocal: { year: number; month: number; day: number };
  workingHours: WorkingHours | null;
  serviceDurationMin: number;
  toUtc: (localDateTime: string) => Date;
  existing: { startsAt: Date; endsAt: Date }[];
  now: Date;
}): Slot[] {
  if (!workingHours) return [];

  const refDate = new Date(
    Date.UTC(dateLocal.year, dateLocal.month - 1, dateLocal.day)
  );
  const dayKey = dayKeyFromDate(refDate);
  const schedule = workingHours[dayKey];
  if (!schedule) return [];

  const { h: sH, m: sM } = parseHm(schedule.start);
  const { h: eH, m: eM } = parseHm(schedule.end);
  const startMin = sH * 60 + sM;
  const endMin = eH * 60 + eM;

  const slots: Slot[] = [];
  const dateStr = `${dateLocal.year.toString().padStart(4, "0")}-${dateLocal.month
    .toString()
    .padStart(2, "0")}-${dateLocal.day.toString().padStart(2, "0")}`;

  for (let m = startMin; m + serviceDurationMin <= endMin; m += SLOT_STEP_MINUTES) {
    const hh = Math.floor(m / 60).toString().padStart(2, "0");
    const mm = (m % 60).toString().padStart(2, "0");
    const time = `${hh}:${mm}`;

    const startsAt = toUtc(`${dateStr} ${time}:00`);
    if (Number.isNaN(startsAt.getTime())) continue;

    if (startsAt.getTime() < now.getTime()) continue;

    const endsAt = new Date(startsAt.getTime() + serviceDurationMin * 60_000);

    const overlaps = existing.some(
      (a) => startsAt < a.endsAt && endsAt > a.startsAt
    );
    if (overlaps) continue;

    slots.push({ time, startsAt, endsAt });
  }

  return slots;
}

/**
 * Devuelve un array con los próximos N días (en zona local del negocio),
 * cada uno marcado como disponible u ocupado.
 */
export function buildDayList(
  startDate: Date,
  count: number,
  workingHours: WorkingHours | null
): { dateLocal: { year: number; month: number; day: number }; available: boolean }[] {
  const result: ReturnType<typeof buildDayList> = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const dayKey = dayKeyFromDate(d);
    const available = !!workingHours?.[dayKey];
    result.push({
      dateLocal: {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
      },
      available,
    });
  }
  return result;
}
