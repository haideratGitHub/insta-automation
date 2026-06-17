import { useState } from "react";
import type { ContentIdea, GrowthData } from "../types";
import { genId } from "../lib/id";
import { todayISO } from "../lib/dates";
import { insertCustomDay, type InsertPayload } from "../lib/plan";
import InsertDayModal from "./InsertDayModal";

interface Props {
  growth: GrowthData;
  setGrowth: (fn: (g: GrowthData) => GrowthData) => void;
  onCreateCarousel: (text: string) => void;
}

type IdeaFormat = ContentIdea["format"];

const FORMAT_STYLE: Record<string, string> = {
  reel: "bg-violet-100 text-violet-700",
  carousel: "bg-emerald-100 text-emerald-700",
  story: "bg-slate-200 text-slate-600",
  any: "bg-slate-100 text-slate-500",
};

export default function IdeasView({
  growth,
  setGrowth,
  onCreateCarousel,
}: Props) {
  const ideas = growth.ideas ?? [];
  const [draft, setDraft] = useState("");
  const [draftFormat, setDraftFormat] = useState<IdeaFormat>("any");
  const [scheduling, setScheduling] = useState<ContentIdea | null>(null);

  function addIdea() {
    const text = draft.trim();
    if (!text) return;
    const idea: ContentIdea = {
      id: genId(),
      text,
      format: draftFormat,
      createdAt: Date.now(),
    };
    setGrowth((g) => ({ ...g, ideas: [idea, ...(g.ideas ?? [])] }));
    setDraft("");
    setDraftFormat("any");
  }

  function patchIdea(id: string, patch: Partial<ContentIdea>) {
    setGrowth((g) => ({
      ...g,
      ideas: (g.ideas ?? []).map((i) =>
        i.id === id ? { ...i, ...patch } : i,
      ),
    }));
  }

  function deleteIdea(id: string) {
    setGrowth((g) => ({
      ...g,
      ideas: (g.ideas ?? []).filter((i) => i.id !== id),
    }));
  }

  function scheduleIdea(dateISO: string, payload: InsertPayload, ideaId: string) {
    setGrowth((g) => ({
      ...g,
      plan: insertCustomDay(g.plan, dateISO, payload),
      ideas: (g.ideas ?? []).filter((i) => i.id !== ideaId),
    }));
    setScheduling(null);
  }

  return (
    <div className="cf-scroll min-w-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <h2 className="text-lg font-bold text-slate-900">Idea inbox</h2>
        <p className="mb-4 text-sm text-slate-500">
          Park reel &amp; carousel ideas the moment they hit, so nothing gets
          lost. Turn one into a carousel, or schedule it onto a calendar day.
        </p>

        {/* capture box */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addIdea();
            }}
            rows={2}
            placeholder="New idea — a hook, an angle, a trade to break down…"
            className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <div className="mt-2 flex items-center gap-2">
            <select
              value={draftFormat}
              onChange={(e) => setDraftFormat(e.target.value as IdeaFormat)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 outline-none"
            >
              <option value="any">Any format</option>
              <option value="reel">Reel</option>
              <option value="carousel">Carousel</option>
              <option value="story">Story</option>
            </select>
            <button
              type="button"
              onClick={addIdea}
              disabled={!draft.trim()}
              className="ml-auto rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Add idea
            </button>
          </div>
        </div>

        {/* list */}
        {ideas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
            No ideas yet — capture your first one above.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">
              {ideas.length} idea{ideas.length === 1 ? "" : "s"}
            </p>
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <textarea
                  value={idea.text}
                  rows={2}
                  onChange={(e) => patchIdea(idea.id, { text: e.target.value })}
                  className="w-full resize-none rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-800 outline-none hover:border-slate-200 focus:border-slate-300 focus:bg-white"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-1">
                  <select
                    value={idea.format}
                    onChange={(e) =>
                      patchIdea(idea.id, {
                        format: e.target.value as IdeaFormat,
                      })
                    }
                    className={`rounded px-1.5 py-0.5 text-xs font-medium outline-none ${
                      FORMAT_STYLE[idea.format] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <option value="any">Any</option>
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="story">Story</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setScheduling(idea)}
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Schedule…
                  </button>
                  {(idea.format === "carousel" || idea.format === "any") && (
                    <button
                      type="button"
                      onClick={() => onCreateCarousel(idea.text)}
                      disabled={!idea.text.trim()}
                      className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                    >
                      → Carousel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteIdea(idea.id)}
                    className="ml-auto rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {scheduling && (
        <InsertDayModal
          title="Schedule idea onto the calendar"
          initialDate={todayISO()}
          initial={{
            mainPost: scheduling.text,
            format:
              scheduling.format === "any" ? "reel" : scheduling.format,
          }}
          onClose={() => setScheduling(null)}
          onSubmit={(dateISO, payload) =>
            scheduleIdea(dateISO, payload, scheduling.id)
          }
        />
      )}
    </div>
  );
}
