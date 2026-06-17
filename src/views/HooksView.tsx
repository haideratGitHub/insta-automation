import { useState } from "react";
import type { GrowthData, Hook, PillarId } from "../types";
import { PILLARS } from "../lib/seed";
import { genId } from "../lib/id";

interface Props {
  growth: GrowthData;
  setGrowth: (fn: (g: GrowthData) => GrowthData) => void;
  onCreateCarousel: (text: string) => void;
}

export default function HooksView({ growth, setGrowth, onCreateCarousel }: Props) {
  const [hideUsed, setHideUsed] = useState(false);
  const hooks = growth.hooks;
  const usedCount = hooks.filter((h) => h.used).length;

  function patchHook(id: string, patch: Partial<Hook>) {
    setGrowth((g) => ({
      ...g,
      hooks: g.hooks.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  }

  function addHook(pillar: PillarId) {
    setGrowth((g) => ({
      ...g,
      hooks: [
        ...g.hooks,
        { id: genId(), text: "", pillar, format: "reel", used: false },
      ],
    }));
  }

  function deleteHook(id: string) {
    setGrowth((g) => ({ ...g, hooks: g.hooks.filter((h) => h.id !== id) }));
  }

  return (
    <div className="cf-scroll min-w-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hook bank</h2>
            <p className="text-sm text-slate-500">
              A hook's only job is to stop the scroll in the first second.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {usedCount}/{hooks.length} used
            </span>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={hideUsed}
                onChange={(e) => setHideUsed(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Hide used
            </label>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tip: mistakes (10–12) and process (13–15) hooks are your highest-save
          material — make those <strong>carousels</strong>. Hooks 1–9 work best
          as Reels.
        </div>

        <div className="space-y-6">
          {PILLARS.map((pillar) => {
            const pillarHooks = hooks.filter(
              (h) => h.pillar === pillar.id && (!hideUsed || !h.used),
            );
            return (
              <section key={pillar.id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {pillar.name}
                    </h3>
                    <p className="text-xs text-slate-400">{pillar.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addHook(pillar.id)}
                    className="text-xs font-medium text-emerald-700 hover:underline"
                  >
                    + Add hook
                  </button>
                </div>

                <div className="space-y-2">
                  {pillarHooks.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
                      No hooks here.
                    </p>
                  )}
                  {pillarHooks.map((hook) => (
                    <div
                      key={hook.id}
                      className={`rounded-xl border bg-white p-3 shadow-sm transition ${
                        hook.used
                          ? "border-slate-200 opacity-60"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <label className="mt-1 flex shrink-0 cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={hook.used}
                            onChange={(e) =>
                              patchHook(hook.id, { used: e.target.checked })
                            }
                            title="Mark as used"
                            className="h-4 w-4 accent-emerald-600"
                          />
                        </label>
                        <textarea
                          value={hook.text}
                          onChange={(e) =>
                            patchHook(hook.id, { text: e.target.value })
                          }
                          rows={2}
                          placeholder="Write a hook…"
                          className={`min-h-0 w-full resize-none rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white ${
                            hook.used ? "line-through" : ""
                          }`}
                        />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-6">
                        {hook.n ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                            #{hook.n}
                          </span>
                        ) : null}
                        <select
                          value={hook.format}
                          onChange={(e) =>
                            patchHook(hook.id, {
                              format: e.target.value as Hook["format"],
                            })
                          }
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600 outline-none"
                        >
                          <option value="reel">Reel</option>
                          <option value="carousel">Carousel</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onCreateCarousel(hook.text)}
                          disabled={!hook.text.trim()}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                        >
                          → Create carousel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHook(hook.id)}
                          className="ml-auto rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
