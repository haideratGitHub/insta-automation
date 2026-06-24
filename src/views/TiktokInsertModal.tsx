import { useEffect, useState } from "react";
import type { TiktokAction } from "../types";
import type { TiktokInsertPayload } from "../lib/tiktokPlan";
import { parseISO } from "../lib/dates";

interface Props {
  initialDate: string;
  initial?: Partial<TiktokInsertPayload>;
  title?: string;
  onClose: () => void;
  onSubmit: (dateISO: string, payload: TiktokInsertPayload) => void;
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export default function TiktokInsertModal({
  initialDate,
  initial,
  title = "Insert custom TikTok day",
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [action, setAction] = useState<TiktokAction>(initial?.action ?? "native");
  const [content, setContent] = useState(initial?.content ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [overlay, setOverlay] = useState(initial?.overlay ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as TiktokAction)}
                className={inputCls}
              >
                <option value="native">TikTok-native</option>
                <option value="repost">Repost (clean export)</option>
                <option value="rest">Rest / engage / review</option>
              </select>
            </div>
            {niceDate && (
              <span className="pb-1.5 text-xs text-slate-400">{niceDate}</span>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Content / topic
            </label>
            <input
              className={inputCls}
              value={content}
              autoFocus
              placeholder="What's this post?"
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              How-to note (optional)
            </label>
            <textarea
              className={inputCls}
              rows={2}
              value={note}
              placeholder="Caption angle, sound, format…"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Ops note (optional)
            </label>
            <input
              className={inputCls}
              value={overlay}
              placeholder="Warm-up / collab / convert…"
              onChange={(e) => setOverlay(e.target.value)}
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
              onClick={() =>
                date && onSubmit(date, { content, action, note, overlay })
              }
              disabled={!date}
              className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50"
            >
              Insert &amp; push plan forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
