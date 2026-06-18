import { useState } from "react";
import type { Carousel, Slide, SlideType } from "../types";
import { parsePaste } from "../lib/parser";
import SlideForm from "./SlideForm";

interface Props {
  carousel: Carousel;
  onUpdateSlide: (slide: Slide) => void;
  onAddSlide: (type: SlideType) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (id: string, dir: -1 | 1) => void;
  onSetCaption: (caption: string) => void;
  onSetHashtags: (hashtags: string) => void;
  onApplyParsed: (data: {
    slides?: Slide[];
    caption?: string;
    hashtags?: string;
  }) => void;
}

const PASTE_EXAMPLE = `[hook]
Why does NQ reject the same level every morning?
*same level*
(and no, it's not random)
---
[value] 01 — gamma walls
Dealers defend price at gamma levels.
Price stalls where dealers are forced to hedge — that's your level.
---
[cta]
Want my order flow cheat sheet?
The exact 1-page framework I read on NQ every session.
> Comment "TAPE" below ↓
~ Save this for your next session
---
[caption]
Same level rejects NQ every morning — here's the order-flow reason why. 📉

Comment "TAPE" and I'll send you the 1-page cheat sheet.
---
[hashtags]
#nq #orderflow #daytrading #futurestrading #gex #priceaction`;

export default function Editor({
  carousel,
  onUpdateSlide,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onSetCaption,
  onSetHashtags,
  onApplyParsed,
}: Props) {
  const [mode, setMode] = useState<"form" | "paste">("form");
  const [pasteText, setPasteText] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  function handleParse() {
    const res = parsePaste(pasteText);
    if (
      res.slides.length === 0 &&
      res.caption === undefined &&
      res.hashtags === undefined
    )
      return;
    onApplyParsed({
      slides: res.slides.length ? res.slides : undefined,
      caption: res.caption,
      hashtags: res.hashtags,
    });
    setMode("form");
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(carousel.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked — ignore
    }
  }

  async function copyHashtags() {
    try {
      await navigator.clipboard.writeText(carousel.hashtags ?? "");
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 1500);
    } catch {
      // clipboard may be blocked — ignore
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* mode toggle */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white p-2">
        <button
          type="button"
          onClick={() => setMode("form")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            mode === "form"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            mode === "paste"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Paste
        </button>
      </div>

      <div className="cf-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {mode === "form" ? (
          <div className="space-y-3">
            {carousel.slides.map((slide, i) => (
              <SlideForm
                key={slide.id}
                slide={slide}
                index={i}
                total={carousel.slides.length}
                onChange={onUpdateSlide}
                onDelete={onDeleteSlide}
                onMove={onMoveSlide}
              />
            ))}

            {/* add buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="self-center text-xs text-slate-400">Add:</span>
              {(["hook", "value", "cta"] as SlideType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onAddSlide(t)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  + {t === "cta" ? "CTA" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* caption */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Instagram caption
                </label>
                <button
                  type="button"
                  onClick={copyCaption}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  {copied ? "Copied!" : "Copy caption"}
                </button>
              </div>
              <textarea
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                rows={5}
                value={carousel.caption}
                placeholder="Write your caption, with a comment-trigger CTA…"
                onChange={(e) => onSetCaption(e.target.value)}
              />

              <div className="mb-1 mt-3 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Hashtags
                </label>
                <button
                  type="button"
                  onClick={copyHashtags}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  {copiedTags ? "Copied!" : "Copy hashtags"}
                </button>
              </div>
              <textarea
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                rows={2}
                value={carousel.hashtags ?? ""}
                placeholder="#nq #orderflow #daytrading …  (drop in your first comment for cleaner captions)"
                onChange={(e) => onSetHashtags(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                Write the whole carousel
              </p>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                Format help
              </button>
            </div>

            {showHelp && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <p className="mb-1">
                  Separate slides with a line containing only{" "}
                  <code className="rounded bg-white px-1">---</code>. First line
                  of a block is the headline.
                </p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li>
                    <code className="rounded bg-white px-1">[hook]</code> /{" "}
                    <code className="rounded bg-white px-1">[value]</code> /{" "}
                    <code className="rounded bg-white px-1">[cta]</code> sets the
                    type (text after <code>[value]</code> is the kicker)
                  </li>
                  <li>
                    <code className="rounded bg-white px-1">*phrase*</code> →
                    accent phrase
                  </li>
                  <li>
                    <code className="rounded bg-white px-1">(text)</code> →
                    subtext
                  </li>
                  <li>
                    <code className="rounded bg-white px-1">&gt; text</code> →
                    CTA pill
                  </li>
                  <li>
                    <code className="rounded bg-white px-1">~ text</code> →
                    footnote
                  </li>
                  <li>
                    <code className="rounded bg-white px-1">[caption]</code> →
                    Instagram caption ·{" "}
                    <code className="rounded bg-white px-1">[hashtags]</code> →
                    hashtags
                  </li>
                </ul>
                <p className="mt-2 text-slate-400">
                  Images are attached afterward in form mode.
                </p>
              </div>
            )}

            <textarea
              className="h-[60vh] w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={pasteText}
              placeholder={PASTE_EXAMPLE}
              onChange={(e) => setPasteText(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleParse}
                disabled={pasteText.trim().length === 0}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                Parse → preview
              </button>
              <button
                type="button"
                onClick={() => setPasteText(PASTE_EXAMPLE)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Load example
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Parsing replaces all current slides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
