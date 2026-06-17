import type { CalendarDay, ContentFormat, ContentPlan } from "../types";
import { genId } from "./id";
import { daysBetween, weekdayShort } from "./dates";

export interface InsertPayload {
  mainPost: string;
  format: ContentFormat;
  hookLine?: string;
  contentBrief?: string;
  cta?: string;
  stories?: string;
}

/**
 * Insert a custom day at `dateISO`, pushing the predetermined content on that
 * date (and everything after it) forward by one day.
 */
export function insertCustomDay(
  plan: ContentPlan,
  dateISO: string,
  payload: InsertPayload,
): ContentPlan {
  if (!plan.startDate) return plan;
  const k = Math.max(0, daysBetween(plan.startDate, dateISO));

  const shifted = plan.days.map((d) =>
    d.offset >= k ? { ...d, offset: d.offset + 1 } : d,
  );

  const day: CalendarDay = {
    id: genId(),
    offset: k,
    day: 0,
    week: 0,
    phase: "Custom",
    weekdayLabel: weekdayShort(dateISO),
    mainPost: payload.mainPost.trim() || "Custom post",
    format: payload.format,
    pillar: "Custom",
    hookLine: payload.hookLine?.trim() || undefined,
    contentBrief: payload.contentBrief?.trim() || undefined,
    cta: payload.cta?.trim() || undefined,
    stories: payload.stories?.trim() || "",
    storiesOnly: payload.format === "story",
    isCustom: true,
    done: false,
  };

  const days = [...shifted, day].sort((a, b) => a.offset - b.offset);
  return { ...plan, days };
}

/**
 * Remove a day and pull everything after it back by one (closes the gap).
 * Used to undo a custom-day insert.
 */
export function removeDay(plan: ContentPlan, id: string): ContentPlan {
  const target = plan.days.find((d) => d.id === id);
  if (!target) return plan;
  const k = target.offset;
  const days = plan.days
    .filter((d) => d.id !== id)
    .map((d) => (d.offset > k ? { ...d, offset: d.offset - 1 } : d));
  return { ...plan, days };
}
