export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DaySchedule = { start: string; end: string } | null;

export type WorkingHours = Record<DayKey, DaySchedule>;

export const DAYS: { key: DayKey; label: string; shortLabel: string }[] = [
  { key: "mon", label: "Lunes", shortLabel: "Lun" },
  { key: "tue", label: "Martes", shortLabel: "Mar" },
  { key: "wed", label: "Miércoles", shortLabel: "Mié" },
  { key: "thu", label: "Jueves", shortLabel: "Jue" },
  { key: "fri", label: "Viernes", shortLabel: "Vie" },
  { key: "sat", label: "Sábado", shortLabel: "Sáb" },
  { key: "sun", label: "Domingo", shortLabel: "Dom" },
];

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  mon: { start: "10:00", end: "20:00" },
  tue: { start: "10:00", end: "20:00" },
  wed: { start: "10:00", end: "20:00" },
  thu: { start: "10:00", end: "20:00" },
  fri: { start: "10:00", end: "20:00" },
  sat: { start: "09:00", end: "18:00" },
  sun: null,
};

/**
 * Converts JS Date.getDay() (0=Sun..6=Sat) to our DayKey.
 */
export function dayKeyFromDate(date: Date): DayKey {
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
}

/**
 * Returns a compact summary like "Lun–Vie 10:00–20:00 · Sáb 9:00–18:00".
 * Groups consecutive days with identical hours.
 */
export function summarizeWorkingHours(wh: WorkingHours | null): string {
  if (!wh) return "Sin horarios configurados";

  type Group = { from: DayKey; to: DayKey; schedule: DaySchedule };
  const groups: Group[] = [];

  for (const { key } of DAYS) {
    const schedule = wh[key];
    const last = groups[groups.length - 1];
    if (last && JSON.stringify(last.schedule) === JSON.stringify(schedule)) {
      last.to = key;
    } else {
      groups.push({ from: key, to: key, schedule });
    }
  }

  const labelFor = (k: DayKey) =>
    DAYS.find((d) => d.key === k)?.shortLabel ?? k;

  const parts: string[] = [];
  for (const g of groups) {
    if (g.schedule === null) continue;
    const range =
      g.from === g.to
        ? labelFor(g.from)
        : `${labelFor(g.from)}–${labelFor(g.to)}`;
    parts.push(`${range} ${g.schedule.start}–${g.schedule.end}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Cerrado todos los días";
}
