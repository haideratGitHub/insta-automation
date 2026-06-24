import type { TiktokAction, TiktokDay, TiktokPlan } from "../types";
import { genId } from "./id";
import { daysBetween, weekdayShort } from "./dates";

export interface TiktokInsertPayload {
  content: string;
  action: TiktokAction;
  note?: string;
  overlay?: string;
}

/** Insert a custom TikTok day at `dateISO`, pushing the plan forward one day. */
export function insertCustomTiktokDay(
  plan: TiktokPlan,
  dateISO: string,
  payload: TiktokInsertPayload,
): TiktokPlan {
  if (!plan.startDate) return plan;
  const k = Math.max(0, daysBetween(plan.startDate, dateISO));

  const shifted = plan.days.map((d) =>
    d.offset >= k ? { ...d, offset: d.offset + 1 } : d,
  );

  const day: TiktokDay = {
    id: genId(),
    offset: k,
    day: 0,
    week: 0,
    phase: "Custom",
    weekdayLabel: weekdayShort(dateISO),
    action: payload.action,
    content: payload.content.trim() || "Custom post",
    note: payload.note?.trim() || undefined,
    overlay: payload.overlay?.trim() || undefined,
    isCustom: true,
    done: false,
  };

  const days = [...shifted, day].sort((a, b) => a.offset - b.offset);
  return { ...plan, days };
}

/** Remove a TikTok day and pull everything after it back one day. */
export function removeTiktokDay(plan: TiktokPlan, id: string): TiktokPlan {
  const target = plan.days.find((d) => d.id === id);
  if (!target) return plan;
  const k = target.offset;
  const days = plan.days
    .filter((d) => d.id !== id)
    .map((d) => (d.offset > k ? { ...d, offset: d.offset - 1 } : d));
  return { ...plan, days };
}
