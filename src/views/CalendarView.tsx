import { useMemo, useState } from "react";
import type { CalendarDay, GrowthData } from "../types";
import {
  addDays,
  daysFromToday,
  parseISO,
  toISO,
  todayISO,
} from "../lib/dates";
import { insertCustomDay, removeDay, type InsertPayload } from "../lib/plan";
import DayModal from "./DayModal";
import InsertDayModal from "./InsertDayModal";

interface Props {
  growth: GrowthData;
  setGrowth: (fn: (g: GrowthData) => GrowthData) => void;
  onCreateCarousel: (text: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FORMAT_DOT: Record<string, string> = {
  reel: "bg-violet-500",
  carousel: "bg-emerald-500",
  story: "bg-slate-400",
};

const PHASE_BORDER: Record<string, string> = {
  "P1 · Ignition": "border-l-amber-400",
  "P2 · Authority": "border-l-sky-400",
  "P3 · Compound": "border-l-violet-400",
};

const PHASE_LEGEND = [
  { label: "P1 · Ignition", dot: "bg-amber-400" },
  { label: "P2 · Authority", dot: "bg-sky-400" },
  { label: "P3 · Compound", dot: "bg-violet-400" },
];

const FORMAT_LEGEND = [
  { label: "Reel", dot: "bg-violet-500" },
  { label: "Carousel", dot: "bg-emerald-500" },
  { label: "Story", dot: "bg-slate-400" },
];

function monthKey(y: number, m: number): number {
  return y * 12 + m;
}

export default function CalendarView({
  growth,
  setGrowth,
  onCreateCarousel,
}: Props) {
  const { plan } = growth;
  const start = plan.startDate;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [insertDate, setInsertDate] = useState<string | null>(null);

  function doInsert(dateISO: string, payload: InsertPayload) {
    setGrowth((g) => ({ ...g, plan: insertCustomDay(g.plan, dateISO, payload) }));
    setInsertDate(null);
  }

  function deleteDay(id: string) {
    setGrowth((g) => ({ ...g, plan: removeDay(g.plan, id) }));
    setSelectedId(null);
  }

  // Map ISO date -> day (date = startDate + offset).
  const { byDate, firstISO, lastISO } = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    if (start) {
      for (const d of plan.days) map.set(addDays(start, d.offset), d);
    }
    const first = start;
    const last =
      start && plan.days.length
        ? addDays(start, plan.days.length - 1)
        : start;
    return { byDate: map, firstISO: first, lastISO: last };
  }, [start, plan.days]);

  // Which month to show.
  const initialMonth = useMemo(() => {
    const anchor =
      firstISO && daysFromToday(firstISO) <= 0 && lastISO && daysFromToday(lastISO) >= 0
        ? todayISO()
        : (firstISO ?? todayISO());
    const d = parseISO(anchor);
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [firstISO, lastISO]);

  const [cursor, setCursor] = useState(initialMonth);

  function patchDay(id: string, patch: Partial<CalendarDay>) {
    setGrowth((g) => ({
      ...g,
      plan: {
        ...g.plan,
        days: g.plan.days.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      },
    }));
  }

  function setStart(iso: string) {
    setGrowth((g) => ({ ...g, plan: { ...g.plan, startDate: iso || null } }));
  }

  // Build a 6-week (42-cell) grid starting on the Monday on/before the 1st.
  const cells = useMemo(() => {
    const monthFirst = new Date(cursor.y, cursor.m, 1);
    const leadMon = (monthFirst.getDay() + 6) % 7; // Mon = 0
    const gridStart = addDays(toISO(monthFirst), -leadMon);
    return Array.from({ length: 42 }, (_, k) => addDays(gridStart, k));
  }, [cursor]);

  const firstMonthKey = firstISO
    ? monthKey(parseISO(firstISO).getFullYear(), parseISO(firstISO).getMonth())
    : monthKey(cursor.y, cursor.m);
  const lastMonthKey = lastISO
    ? monthKey(parseISO(lastISO).getFullYear(), parseISO(lastISO).getMonth())
    : monthKey(cursor.y, cursor.m);
  const curKey = monthKey(cursor.y, cursor.m);

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const total = c.y * 12 + c.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });
  }

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const doneCount = plan.days.filter((d) => d.done).length;
  const total = plan.days.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const selected = selectedId
    ? plan.days.find((d) => d.id === selectedId)
    : undefined;
  const selectedISO =
    selected && start ? addDays(start, selected.offset) : null;

  return (
    <div className="cf-scroll min-w-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* header */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              100-day content calendar
            </h2>
            <p className="text-sm text-slate-500">
              Click any day to open its full brief, hook line &amp; CTA.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Plan starts
            <input
              type="date"
              value={start ?? ""}
              onChange={(e) => setStart(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:border-slate-500"
            />
          </label>
        </div>

        {/* progress */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Progress</span>
            <span className="text-slate-500">
              {doneCount}/{total} days posted ({pct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* month nav + legends */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={curKey <= firstMonthKey}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ←
            </button>
            <span className="min-w-37.5 text-center text-sm font-semibold text-slate-800">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={curKey >= lastMonthKey}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              →
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {FORMAT_LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                {l.label}
              </span>
            ))}
            <span className="text-slate-300">|</span>
            {PHASE_LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-sm ${l.dot}`} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* calendar grid */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="px-2 py-1.5 text-center text-xs font-semibold text-slate-500"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((iso) => {
              const day = byDate.get(iso);
              const date = parseISO(iso);
              const inMonth = date.getMonth() === cursor.m;
              const isToday = daysFromToday(iso) === 0;
              const isPast = daysFromToday(iso) < 0;

              return (
                <div
                  key={iso}
                  className={`group min-h-24 border-b border-r border-slate-100 p-1.5 ${
                    inMonth ? "" : "bg-slate-50/60"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"
                          : inMonth
                            ? "text-slate-500"
                            : "text-slate-300"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="flex items-center gap-1">
                      {start && (
                        <button
                          type="button"
                          onClick={() => setInsertDate(iso)}
                          title="Insert a custom day here (pushes the plan forward)"
                          className="rounded text-sm leading-none text-slate-300 opacity-0 transition hover:text-emerald-600 group-hover:opacity-100"
                        >
                          +
                        </button>
                      )}
                      {day && (
                        <input
                          type="checkbox"
                          checked={day.done}
                          onChange={(e) =>
                            patchDay(day.id, { done: e.target.checked })
                          }
                          onClick={(e) => e.stopPropagation()}
                          title="Mark done"
                          className="h-3.5 w-3.5 accent-emerald-600"
                        />
                      )}
                    </div>
                  </div>

                  {day && (
                    <button
                      type="button"
                      onClick={() => setSelectedId(day.id)}
                      className={`w-full rounded-md border-l-4 bg-slate-50 p-1.5 text-left transition hover:bg-slate-100 ${
                        day.isCustom
                          ? "border-l-pink-400"
                          : (PHASE_BORDER[day.phase] ?? "border-l-slate-300")
                      } ${
                        isToday ? "ring-2 ring-emerald-200" : ""
                      } ${day.done ? "opacity-50" : ""}`}
                    >
                      <div className="mb-0.5 flex items-center gap-1">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            FORMAT_DOT[day.format] ?? "bg-slate-400"
                          }`}
                        />
                        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {day.storiesOnly ? "Story" : day.format}
                        </span>
                        {day.isCustom && (
                          <span className="rounded bg-pink-100 px-1 text-[10px] font-medium text-pink-600">
                            custom
                          </span>
                        )}
                        {day.isLeadMagnet && (
                          <span className="ml-auto text-[11px] text-amber-500">
                            ★
                          </span>
                        )}
                      </div>
                      <p
                        className={`line-clamp-3 text-[11px] leading-snug text-slate-700 ${
                          day.done ? "line-through" : ""
                        }`}
                      >
                        {day.mainPost || day.stories}
                      </p>
                      {isPast && !day.done && (
                        <span className="mt-0.5 block text-[10px] text-red-400">
                          missed?
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* rules + quick-start */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Rules that matter more than the schedule
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {growth.rules.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Quick-start (this week)
            </h3>
            <ul className="space-y-1.5">
              {growth.quickStart.map((q) => (
                <li key={q.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={q.done}
                      onChange={() =>
                        setGrowth((g) => ({
                          ...g,
                          quickStart: g.quickStart.map((x) =>
                            x.id === q.id ? { ...x, done: !x.done } : x,
                          ),
                        }))
                      }
                      className="mt-0.5 h-4 w-4 accent-emerald-600"
                    />
                    <span className={q.done ? "text-slate-400 line-through" : ""}>
                      {q.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selected && selectedISO && (
        <DayModal
          day={selected}
          dateISO={selectedISO}
          isToday={daysFromToday(selectedISO) === 0}
          onClose={() => setSelectedId(null)}
          onPatch={(patch) => patchDay(selected.id, patch)}
          onDelete={selected.isCustom ? () => deleteDay(selected.id) : undefined}
          onCreateCarousel={(text) => {
            onCreateCarousel(text);
            setSelectedId(null);
          }}
        />
      )}

      {insertDate && (
        <InsertDayModal
          initialDate={insertDate}
          onClose={() => setInsertDate(null)}
          onSubmit={doInsert}
        />
      )}
    </div>
  );
}
