import { useEffect, useMemo, useState } from "react";
import type { TiktokDay } from "../types";
import { parseISO } from "../lib/dates";
import { buildTiktokScriptPrompt } from "../lib/prompt";

interface Props {
  day: TiktokDay;
  dateISO: string;
  isToday: boolean;
  onClose: () => void;
  onPatch: (patch: Partial<TiktokDay>) => void;
  onDelete?: () => void;
}

const ACTION_STYLE: Record<string, string> = {
  repost: "bg-sky-100 text-sky-700",
  native: "bg-fuchsia-100 text-fuchsia-700",
  rest: "bg-slate-200 text-slate-600",
};
const ACTION_LABEL: Record<string, string> = {
  repost: "Repost (clean export)",
  native: "TikTok-native",
  rest: "Rest / engage / review",
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

export default function TiktokDayModal({
  day,
  dateISO,
  isToday,
  onClose,
  onPatch,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const prompt = useMemo(() => buildTiktokScriptPrompt(day), [day]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const niceDate = parseISO(dateISO).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isRest = day.action === "rest";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {day.isCustom ? "Custom TikTok" : `Day ${day.day}`}
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
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  ACTION_STYLE[day.action] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {ACTION_LABEL[day.action] ?? day.action}
              </span>
              {day.isCustom ? (
                <span className="rounded bg-pink-100 px-1.5 py-0.5 text-xs font-medium text-pink-600">
                  Custom
                </span>
              ) : (
                <>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {day.phase}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    Week {day.week}
                  </span>
                </>
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

          <Field
            label={isRest ? "Rest / engage / review plan" : "Content / topic"}
            value={day.content}
            onChange={(v) => onPatch({ content: v })}
            rows={2}
            placeholder="What's this post?"
          />

          <Field
            label="How-to note"
            value={day.note ?? ""}
            onChange={(v) => onPatch({ note: v })}
            rows={2}
            placeholder="Caption angle, sound, format…"
          />

          <Field
            label="Ops note (overlay)"
            value={day.overlay ?? ""}
            onChange={(v) => onPatch({ overlay: v })}
            rows={2}
            placeholder="Warm-up / collab / convert / monthly review…"
          />

          {!isRest && (
            <div className="space-y-2.5 rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-800">
                Generate a TikTok script with Claude
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-fuchsia-900/70">
                  Custom angle (optional)
                </label>
                <textarea
                  value={day.customContent ?? ""}
                  rows={2}
                  placeholder="Your specific take, trade, or trend to build the script around."
                  onChange={(e) => onPatch({ customContent: e.target.value })}
                  className="w-full resize-none rounded-md border border-fuchsia-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
                >
                  {copied ? "Prompt copied ✓" : "Copy script prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrompt((v) => !v)}
                  className="rounded-lg border border-fuchsia-300 bg-white px-3 py-2 text-sm font-medium text-fuchsia-700 hover:bg-fuchsia-50"
                >
                  {showPrompt ? "Hide prompt" : "Preview prompt"}
                </button>
              </div>
              {showPrompt && (
                <textarea
                  readOnly
                  value={prompt}
                  rows={12}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full resize-y rounded-md border border-fuchsia-200 bg-white px-2.5 py-1.5 font-mono text-xs leading-relaxed text-slate-700 outline-none"
                />
              )}
              <p className="text-xs leading-relaxed text-fuchsia-800/80">
                Paste into Claude → it returns a ready-to-film hook, script,
                on-screen text, caption &amp; hashtags.
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
