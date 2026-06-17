// Local-date helpers. We treat yyyy-mm-dd strings as *local* calendar dates
// (parsed from parts) to avoid UTC off-by-one shifts.

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const dt = parseISO(iso);
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
}

/** ISO date of the Monday of the week containing `date` (defaults to today). */
export function mondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

export function weekdayShort(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-US", { weekday: "short" });
}

export function formatNice(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Whole-day difference (iso - today) in days; negative = past, 0 = today. */
export function daysFromToday(iso: string): number {
  const a = parseISO(iso).getTime();
  const b = parseISO(todayISO()).getTime();
  return Math.round((a - b) / 86400000);
}
