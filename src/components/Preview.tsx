import { useEffect, useRef, useState } from "react";
import type { Slide } from "../types";
import { SLIDE_W, SLIDE_H } from "../constants";
import SlideRenderer from "./SlideRenderer";

interface Props {
  slides: Slide[];
  /** Register/unregister the intrinsic 1080×1350 capture node for a slide. */
  registerRef: (id: string, node: HTMLElement | null) => void;
  onDownloadAll: () => void;
  onDownloadOne: (id: string, index: number) => void;
  exporting: boolean;
  progress: string;
}

/** Measure a container's content width with a ResizeObserver. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export default function Preview({
  slides,
  registerRef,
  onDownloadAll,
  onDownloadOne,
  exporting,
  progress,
}: Props) {
  const { ref, width } = useWidth();

  // Fit a single slide column into the available width (with side padding),
  // clamped so it never gets comically large or unusably small.
  const available = Math.max(width - 48, 120);
  const scale = Math.min(0.5, Math.max(0.18, available / SLIDE_W));

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-slate-100">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">Preview</h2>
          <p className="truncate text-xs text-slate-500">
            {slides.length} slide{slides.length === 1 ? "" : "s"} · exports at
            1080 × 1350
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadAll}
          disabled={exporting || slides.length === 0}
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? progress || "Exporting…" : "Download all (.zip)"}
        </button>
      </div>

      {/* scaled slide stack */}
      <div ref={ref} className="cf-scroll min-h-0 flex-1 overflow-y-auto p-6">
        {slides.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            No slides yet — add one in the editor on the left.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="group relative"
                style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}
              >
                {/* flow-box: occupies the *scaled* size so the page lays out
                    correctly. Clips the scaled-down slide inside it. */}
                <div
                  className="overflow-hidden rounded-xl shadow-md ring-1 ring-black/10"
                  style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}
                >
                  {/* scaler: carries the transform (NOT the slide node). */}
                  <div
                    style={{
                      width: SLIDE_W,
                      height: SLIDE_H,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {/* capture node: true intrinsic 1080×1350, no transform.
                        html-to-image ignores the ancestor scale → full res. */}
                    <div
                      ref={(node) => registerRef(slide.id, node)}
                      style={{ width: SLIDE_W, height: SLIDE_H }}
                    >
                      <SlideRenderer
                        slide={slide}
                        index={i}
                        total={slides.length}
                      />
                    </div>
                  </div>
                </div>

                {/* per-slide download (on hover) */}
                <button
                  type="button"
                  onClick={() => onDownloadOne(slide.id, i + 1)}
                  disabled={exporting}
                  title={`Download slide ${i + 1}`}
                  className="absolute right-2 top-2 rounded-md bg-slate-900/85 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow transition hover:bg-slate-900 disabled:opacity-40 group-hover:opacity-100"
                >
                  ↓ PNG
                </button>

                {/* slide index badge */}
                <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
