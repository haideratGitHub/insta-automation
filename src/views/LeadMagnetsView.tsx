import { useState } from "react";
import type { GrowthData } from "../types";

interface Props {
  growth: GrowthData;
  setGrowth: (fn: (g: GrowthData) => GrowthData) => void;
}

export default function LeadMagnetsView({ growth, setGrowth }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function selectMagnet(id: string) {
    setGrowth((g) => ({ ...g, selectedLeadMagnetId: id }));
  }

  function patchMagnet(id: string, patch: Partial<{ title: string; description: string }>) {
    setGrowth((g) => ({
      ...g,
      leadMagnets: g.leadMagnets.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  }

  function toggleCheat(id: string) {
    setGrowth((g) => ({
      ...g,
      cheatSheet: g.cheatSheet.map((c) =>
        c.id === id ? { ...c, done: !c.done } : c,
      ),
    }));
  }

  function patchSnippet(id: string, text: string) {
    setGrowth((g) => ({
      ...g,
      snippets: g.snippets.map((s) => (s.id === id ? { ...s, text } : s)),
    }));
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // clipboard may be blocked — ignore
    }
  }

  return (
    <div className="cf-scroll min-w-0 flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-3xl p-6">
        <h2 className="text-lg font-bold text-slate-900">Lead magnet</h2>
        <p className="mb-4 text-sm text-slate-500">
          Your comment-to-DM growth lever. Pick one resource, build it, then run
          the comment trigger on your Reels &amp; carousels.
        </p>

        {/* magnet options */}
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Pick your first resource
          </h3>
          <div className="space-y-2">
            {growth.leadMagnets.map((m) => {
              const selected = m.id === growth.selectedLeadMagnetId;
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-3 transition ${
                    selected
                      ? "border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-200"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="leadmagnet"
                      checked={selected}
                      onChange={() => selectMagnet(m.id)}
                      className="mt-1 h-4 w-4 accent-emerald-600"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        value={m.title}
                        onChange={(e) =>
                          patchMagnet(m.id, { title: e.target.value })
                        }
                        className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-slate-800 outline-none hover:border-slate-200 focus:border-slate-300 focus:bg-white"
                      />
                      <textarea
                        value={m.description}
                        onChange={(e) =>
                          patchMagnet(m.id, { description: e.target.value })
                        }
                        rows={2}
                        className="mt-1 w-full resize-none rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-slate-500 outline-none hover:border-slate-200 focus:border-slate-300 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* build checklist */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            What goes in it
          </h3>
          <ul className="space-y-2">
            {growth.cheatSheet.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => toggleCheat(c.id)}
                    className="mt-0.5 h-4 w-4 accent-emerald-600"
                  />
                  <span className={c.done ? "text-slate-400 line-through" : ""}>
                    {c.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* copy snippets */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Copy to use
          </h3>
          <div className="space-y-3">
            {growth.snippets.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {s.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(s.id, s.text)}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    {copiedId === s.id ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  value={s.text}
                  onChange={(e) => patchSnippet(s.id, e.target.value)}
                  rows={s.text.length > 120 ? 5 : 2}
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
