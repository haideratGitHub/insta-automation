import { useEffect, useState } from "react";
import type { ContentFormat } from "../types";
import type { InsertPayload } from "../lib/plan";
import { parseISO } from "../lib/dates";

interface Props {
  initialDate: string;
  allowDateEdit?: boolean;
  initial?: Partial<InsertPayload>;
  title?: string;
  onClose: () => void;
  onSubmit: (dateISO: string, payload: InsertPayload) => void;
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export default function InsertDayModal({
  initialDate,
  allowDateEdit = true,
  initial,
  title = "Insert custom day",
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [format, setFormat] = useState<ContentFormat>(
    initial?.format ?? "reel",
  );
  const [mainPost, setMainPost] = useState(initial?.mainPost ?? "");
  const [hookLine, setHookLine] = useState(initial?.hookLine ?? "");
  const [contentBrief, setContentBrief] = useState(initial?.contentBrief ?? "");
  const [cta, setCta] = useState(initial?.cta ?? "");
  const [stories, setStories] = useState(initial?.stories ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const storiesOnly = format === "story";

  function submit() {
    if (!date) return;
    onSubmit(date, {
      mainPost,
      format,
      hookLine: storiesOnly ? undefined : hookLine,
      contentBrief,
      cta: storiesOnly ? undefined : cta,
      stories,
    });
  }

  const niceDate = date
    ? parseISO(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-500">
              The plan content on this date (and after) moves forward one day.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Date
              </label>
              <input
                type="date"
                value={date}
                disabled={!allowDateEdit}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputCls} disabled:bg-slate-100`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className={inputCls}
              >
                <option value="reel">Reel</option>
                <option value="carousel">Carousel</option>
                <option value="story">Story</option>
              </select>
            </div>
            {niceDate && (
              <span className="pb-1.5 text-xs text-slate-400">{niceDate}</span>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Working title
            </label>
            <input
              className={inputCls}
              value={mainPost}
              autoFocus
              placeholder="What's this post?"
              onChange={(e) => setMainPost(e.target.value)}
            />
          </div>

          {!storiesOnly && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Hook line (optional)
              </label>
              <textarea
                className={inputCls}
                rows={2}
                value={hookLine}
                placeholder="The first-frame scroll-stopper…"
                onChange={(e) => setHookLine(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {storiesOnly ? "What to do" : "Content brief (optional)"}
            </label>
            <textarea
              className={inputCls}
              rows={2}
              value={contentBrief}
              placeholder="What to actually make…"
              onChange={(e) => setContentBrief(e.target.value)}
            />
          </div>

          {!storiesOnly && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Call to action (optional)
              </label>
              <input
                className={inputCls}
                value={cta}
                placeholder="Follow / Save / Comment …"
                onChange={(e) => setCta(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Stories (optional)
            </label>
            <input
              className={inputCls}
              value={stories}
              placeholder="Companion Stories idea…"
              onChange={(e) => setStories(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!date}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Insert &amp; push plan forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
