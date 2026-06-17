import { useEffect, useMemo, useState } from "react";
import type { CalendarDay } from "../types";
import { parseISO } from "../lib/dates";
import { buildCarouselPrompt } from "../lib/prompt";

interface Props {
  day: CalendarDay;
  dateISO: string;
  isToday: boolean;
  onClose: () => void;
  onPatch: (patch: Partial<CalendarDay>) => void;
  onCreateCarousel: (text: string) => void;
  onDelete?: () => void; // only for user-inserted custom days
}

const FORMAT_STYLE: Record<string, string> = {
  reel: "bg-violet-100 text-violet-700",
  carousel: "bg-emerald-100 text-emerald-700",
  story: "bg-slate-200 text-slate-600",
};

function Field({
  label,
  value,
  onChange,
  rows = 2,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}

export default function DayModal({
  day,
  dateISO,
  isToday,
  onClose,
  onPatch,
  onCreateCarousel,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const prompt = useMemo(() => buildCarouselPrompt(day), [day]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard may be blocked — ignore
    }
  }

  const niceDate = parseISO(dateISO).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {day.isCustom ? "Custom post" : `Day ${day.day}`}
              </span>
              <span className="text-xs text-slate-400">· {niceDate}</span>
              {isToday && (
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  Today
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${
                  FORMAT_STYLE[day.format] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {day.storiesOnly ? "Story only" : day.format}
              </span>
              {day.isCustom ? (
                <span className="rounded bg-pink-100 px-1.5 py-0.5 text-xs font-medium text-pink-600">
                  Custom
                </span>
              ) : (
                <>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {day.pillar}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {day.phase}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    Week {day.week}
                  </span>
                </>
              )}
              {day.isLeadMagnet && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                  Lead magnet
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="space-y-3 p-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={day.done}
              onChange={(e) => onPatch({ done: e.target.checked })}
              className="h-4 w-4 accent-emerald-600"
            />
            Mark this day done
          </label>

          {!day.storiesOnly && (
            <Field
              label="Working title"
              value={day.mainPost}
              onChange={(v) => onPatch({ mainPost: v })}
              rows={1}
              placeholder="Working title…"
            />
          )}

          {!day.storiesOnly && (
            <Field
              label="Hook line (on-screen scroll-stopper)"
              value={day.hookLine ?? ""}
              onChange={(v) => onPatch({ hookLine: v })}
              placeholder="The first-frame hook…"
            />
          )}

          <Field
            label={day.storiesOnly ? "What to do" : "Content brief"}
            value={day.contentBrief ?? ""}
            onChange={(v) => onPatch({ contentBrief: v })}
            rows={3}
            placeholder="What to actually make…"
          />

          {!day.storiesOnly && (
            <Field
              label="Call to action"
              value={day.cta ?? ""}
              onChange={(v) => onPatch({ cta: v })}
              rows={1}
              placeholder="Follow / Save / Comment …"
            />
          )}

          <Field
            label="Stories"
            value={day.stories}
            onChange={(v) => onPatch({ stories: v })}
            placeholder="Stories idea…"
          />

          <Field
            label="Ops notes (collab / convert / review)"
            value={day.notes ?? ""}
            onChange={(v) => onPatch({ notes: v })}
            rows={2}
            placeholder="Monthly review, collab outreach, conversion push…"
          />

          {day.format === "carousel" && (
            <div className="space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Generate carousel content with Claude
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-emerald-900/70">
                  Custom content / your angle (optional)
                </label>
                <textarea
                  value={day.customContent ?? ""}
                  rows={3}
                  placeholder="Your specific trade, example, levels, numbers, or angle for this carousel — Claude builds around this first."
                  onChange={(e) => onPatch({ customContent: e.target.value })}
                  className="w-full resize-none rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {copied ? "Prompt copied ✓" : "Copy Claude prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrompt((v) => !v)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  {showPrompt ? "Hide prompt" : "Preview prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => onCreateCarousel(day.hookLine || day.mainPost)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  → New blank carousel
                </button>
              </div>

              {showPrompt && (
                <textarea
                  readOnly
                  value={prompt}
                  rows={12}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full resize-y rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 font-mono text-xs leading-relaxed text-slate-700 outline-none"
                />
              )}

              <p className="text-xs leading-relaxed text-emerald-800/80">
                Paste into Claude → copy its reply → <strong>Carousels</strong>{" "}
                tab → <strong>Paste</strong> mode → “Parse → preview”.
              </p>
            </div>
          )}

          {day.isCustom && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this custom day? The plan shifts back one day."))
                  onDelete();
              }}
              className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete custom day (pull plan back)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
