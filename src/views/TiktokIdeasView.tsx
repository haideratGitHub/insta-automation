import { useState } from "react";
import type { GrowthData, TiktokIdea, TiktokIdeaFormat } from "../types";
import { genId } from "../lib/id";
import { todayISO } from "../lib/dates";
import {
  insertCustomTiktokDay,
  type TiktokInsertPayload,
} from "../lib/tiktokPlan";
import TiktokInsertModal from "./TiktokInsertModal";

interface Props {
  growth: GrowthData;
  setGrowth: (fn: (g: GrowthData) => GrowthData) => void;
}

const FORMAT_STYLE: Record<string, string> = {
  native: "bg-fuchsia-100 text-fuchsia-700",
  repost: "bg-sky-100 text-sky-700",
  any: "bg-slate-100 text-slate-500",
};

export default function TiktokIdeasView({ growth, setGrowth }: Props) {
  const ideas = growth.tiktok.ideas ?? [];
  const [draft, setDraft] = useState("");
  const [draftFormat, setDraftFormat] = useState<TiktokIdeaFormat>("any");
  const [scheduling, setScheduling] = useState<TiktokIdea | null>(null);

  function addIdea() {
    const text = draft.trim();
    if (!text) return;
    const idea: TiktokIdea = {
      id: genId(),
      text,
      format: draftFormat,
      createdAt: Date.now(),
    };
    setGrowth((g) => ({
      ...g,
      tiktok: { ...g.tiktok, ideas: [idea, ...(g.tiktok.ideas ?? [])] },
    }));
    setDraft("");
    setDraftFormat("any");
  }

  function patchIdea(id: string, patch: Partial<TiktokIdea>) {
    setGrowth((g) => ({
      ...g,
      tiktok: {
        ...g.tiktok,
        ideas: (g.tiktok.ideas ?? []).map((i) =>
          i.id === id ? { ...i, ...patch } : i,
        ),
      },
    }));
  }

  function deleteIdea(id: string) {
    setGrowth((g) => ({
      ...g,
      tiktok: {
        ...g.tiktok,
        ideas: (g.tiktok.ideas ?? []).filter((i) => i.id !== id),
      },
    }));
  }

  function schedule(dateISO: string, payload: TiktokInsertPayload, ideaId: string) {
    setGrowth((g) => ({
      ...g,
      tiktok: {
        ...g.tiktok,
        plan: insertCustomTiktokDay(g.tiktok.plan, dateISO, payload),
        ideas: (g.tiktok.ideas ?? []).filter((i) => i.id !== ideaId),
      },
    }));
    setScheduling(null);
  }

  return (
    <div className="cf-scroll min-w-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <h2 className="text-lg font-bold text-slate-900">TikTok idea inbox</h2>
        <p className="mb-4 text-sm text-slate-500">
          Park TikTok ideas — trends, hooks, stitch/duet targets — the moment
          they hit. Schedule one onto a calendar day when you're ready.
        </p>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") addIdea();
            }}
            rows={2}
            placeholder="New TikTok idea — a trend to ride, a hook, a clip to stitch…"
            className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <div className="mt-2 flex items-center gap-2">
            <select
              value={draftFormat}
              onChange={(e) =>
                setDraftFormat(e.target.value as TiktokIdeaFormat)
              }
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 outline-none"
            >
              <option value="any">Any</option>
              <option value="native">TikTok-native</option>
              <option value="repost">Repost</option>
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

        {ideas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
            No TikTok ideas yet — capture your first one above.
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
                        format: e.target.value as TiktokIdeaFormat,
                      })
                    }
                    className={`rounded px-1.5 py-0.5 text-xs font-medium outline-none ${
                      FORMAT_STYLE[idea.format] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <option value="any">Any</option>
                    <option value="native">TikTok-native</option>
                    <option value="repost">Repost</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setScheduling(idea)}
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Schedule…
                  </button>
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
        <TiktokInsertModal
          title="Schedule idea onto the TikTok calendar"
          initialDate={todayISO()}
          initial={{
            content: scheduling.text,
            action: scheduling.format === "repost" ? "repost" : "native",
          }}
          onClose={() => setScheduling(null)}
          onSubmit={(dateISO, payload) =>
            schedule(dateISO, payload, scheduling.id)
          }
        />
      )}
    </div>
  );
}
