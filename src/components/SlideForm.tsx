import { useRef, useState } from "react";
import type { Slide, SlideType } from "../types";
import { valueHasChart } from "../types";

interface Props {
  slide: Slide;
  index: number;
  total: number;
  onChange: (slide: Slide) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-slate-500">
      {children}
    </label>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Convert a slide to a new type, preserving headline/body where it makes sense. */
function convertType(slide: Slide, type: SlideType): Slide {
  const headline = slide.headline;
  const body = "body" in slide ? slide.body : undefined;
  switch (type) {
    case "hook":
      return { id: slide.id, type, headline, accentPhrase: "", subtext: "" };
    case "value":
      return { id: slide.id, type, headline, body, kicker: "" };
    case "cta":
      return { id: slide.id, type, headline, body, ctaText: "", footnote: "" };
  }
}

export default function SlideForm({
  slide,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const typeLabel =
    slide.type === "hook" ? "Hook" : slide.type === "cta" ? "CTA" : "Value";

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || slide.type !== "value") return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataURL(file);
    onChange({ ...slide, imageDataUrl: dataUrl });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* card header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-900 px-1.5 text-xs font-semibold text-white">
          {index + 1}
        </span>
        <select
          value={slide.type}
          onChange={(e) =>
            onChange(convertType(slide, e.target.value as SlideType))
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-slate-500"
          aria-label="Slide type"
        >
          <option value="hook">Hook</option>
          <option value="value">Value</option>
          <option value="cta">CTA</option>
        </select>
        <span className="text-xs text-slate-400">{typeLabel} slide</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(slide.id, -1)}
            disabled={index === 0}
            title="Move up"
            className="rounded-md px-1.5 py-1 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(slide.id, 1)}
            disabled={index === total - 1}
            title="Move down"
            className="rounded-md px-1.5 py-1 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onDelete(slide.id)}
            title="Delete slide"
            className="rounded-md px-1.5 py-1 text-red-500 transition hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      </div>

      {/* fields per type */}
      <div className="space-y-3">
        {slide.type === "value" && (
          <div>
            <Label>Kicker (small top-left label)</Label>
            <input
              className={inputCls}
              value={slide.kicker ?? ""}
              placeholder="01 — gamma walls"
              onChange={(e) => onChange({ ...slide, kicker: e.target.value })}
            />
          </div>
        )}

        <div>
          <Label>Headline</Label>
          <textarea
            className={inputCls}
            rows={2}
            value={slide.headline}
            placeholder="The scroll-stopper"
            onChange={(e) => onChange({ ...slide, headline: e.target.value })}
          />
        </div>

        {slide.type === "hook" && (
          <>
            <div>
              <Label>Accent phrase (substring of headline to color green)</Label>
              <input
                className={inputCls}
                value={slide.accentPhrase ?? ""}
                placeholder="same level"
                onChange={(e) =>
                  onChange({ ...slide, accentPhrase: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Subtext</Label>
              <input
                className={inputCls}
                value={slide.subtext ?? ""}
                placeholder="(and no, it's not random)"
                onChange={(e) =>
                  onChange({ ...slide, subtext: e.target.value })
                }
              />
            </div>
          </>
        )}

        {slide.type === "value" && (
          <>
            <div>
              <Label>Body</Label>
              <textarea
                className={inputCls}
                rows={3}
                value={slide.body ?? ""}
                placeholder="One idea, in sentence case."
                onChange={(e) => onChange({ ...slide, body: e.target.value })}
              />
            </div>
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={valueHasChart(slide)}
                  onChange={(e) =>
                    onChange({ ...slide, showChart: e.target.checked })
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Include chart image
                <span className="font-normal text-slate-400">
                  {valueHasChart(slide) ? "" : "— text is centered"}
                </span>
              </label>
            </div>
            {valueHasChart(slide) && (
              <div>
                <Label>Chart image</Label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInput.current?.click()}
                className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-3 py-4 text-center text-xs transition ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400"
                }`}
              >
                {slide.imageDataUrl ? (
                  <>
                    <img
                      src={slide.imageDataUrl}
                      alt=""
                      className="h-12 w-16 rounded object-cover"
                    />
                    <span>Click or drop to replace</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({ ...slide, imageDataUrl: undefined });
                      }}
                      className="rounded bg-white px-2 py-1 font-medium text-red-500 ring-1 ring-slate-200 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span>Drop a chart screenshot here, or click to upload</span>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              </div>
            )}
          </>
        )}

        {slide.type === "cta" && (
          <>
            <div>
              <Label>Body</Label>
              <textarea
                className={inputCls}
                rows={2}
                value={slide.body ?? ""}
                placeholder="The exact 1-page framework…"
                onChange={(e) => onChange({ ...slide, body: e.target.value })}
              />
            </div>
            <div>
              <Label>CTA text (the accent pill)</Label>
              <input
                className={inputCls}
                value={slide.ctaText}
                placeholder={'Comment "TAPE" below ↓'}
                onChange={(e) => onChange({ ...slide, ctaText: e.target.value })}
              />
            </div>
            <div>
              <Label>Footnote</Label>
              <input
                className={inputCls}
                value={slide.footnote ?? ""}
                placeholder="Save this for your next session"
                onChange={(e) =>
                  onChange({ ...slide, footnote: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
