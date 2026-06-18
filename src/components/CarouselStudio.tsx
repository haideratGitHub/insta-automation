import { useRef, useState } from "react";
import type { Carousel, Slide, SlideType } from "../types";
import { makeSlide } from "../lib/carousel";
import { downloadAll, downloadSlide } from "../lib/exporter";
import Editor from "./Editor";
import Preview from "./Preview";

interface Props {
  carousels: Carousel[];
  current: Carousel | null;
  onChange: (carousel: Carousel) => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export default function CarouselStudio({
  carousels,
  current,
  onChange,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: Props) {
  // Map<slideId, intrinsic 1080×1350 capture node> — exported from these refs.
  const slideRefs = useRef<Map<string, HTMLElement>>(new Map());
  const registerRef = (id: string, node: HTMLElement | null) => {
    if (node) slideRefs.current.set(id, node);
    else slideRefs.current.delete(id);
  };

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState("");

  if (!current) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-slate-100">
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          + New carousel
        </button>
      </div>
    );
  }

  const carousel = current;

  // --- slide mutations on the current carousel ----------------------------
  const updateSlide = (updated: Slide) =>
    onChange({
      ...carousel,
      slides: carousel.slides.map((s) => (s.id === updated.id ? updated : s)),
    });

  const addSlide = (type: SlideType) =>
    onChange({ ...carousel, slides: [...carousel.slides, makeSlide(type)] });

  const deleteSlide = (id: string) =>
    onChange({ ...carousel, slides: carousel.slides.filter((s) => s.id !== id) });

  const moveSlide = (id: string, dir: -1 | 1) => {
    const i = carousel.slides.findIndex((s) => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= carousel.slides.length) return;
    const slides = [...carousel.slides];
    [slides[i], slides[j]] = [slides[j], slides[i]];
    onChange({ ...carousel, slides });
  };

  const setCaption = (caption: string) => onChange({ ...carousel, caption });
  const setHashtags = (hashtags: string) => onChange({ ...carousel, hashtags });

  // Apply a parse result in ONE update — applying slides/caption/hashtags as
  // separate onChange calls would each rebuild from the stale snapshot and
  // clobber the others.
  const applyParsed = (data: {
    slides?: Slide[];
    caption?: string;
    hashtags?: string;
  }) =>
    onChange({
      ...carousel,
      ...(data.slides ? { slides: data.slides } : {}),
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.hashtags !== undefined ? { hashtags: data.hashtags } : {}),
    });

  // --- export -------------------------------------------------------------
  async function handleDownloadAll() {
    if (exporting) return;
    setExporting(true);
    setProgress("Exporting…");
    try {
      await downloadAll(carousel.slides, slideRefs.current, (done, total) =>
        setProgress(`Exporting ${done}/${total}…`),
      );
    } catch (err) {
      console.error(err);
      alert("Export failed. Check the console for details.");
    } finally {
      setExporting(false);
      setProgress("");
    }
  }

  async function handleDownloadOne(id: string, index: number) {
    if (exporting) return;
    const node = slideRefs.current.get(id);
    if (!node) return;
    setExporting(true);
    try {
      await downloadSlide(node, index);
    } catch (err) {
      console.error(err);
      alert("Export failed. Check the console for details.");
    } finally {
      setExporting(false);
    }
  }

  function rename() {
    const next = prompt("Rename carousel", carousel.title);
    if (next && next.trim()) onRename(carousel.id, next.trim());
  }

  function remove() {
    if (confirm(`Delete "${carousel.title}"? This can't be undone.`)) {
      onDelete(carousel.id);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* library toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <span className="text-xs font-medium text-slate-400">Carousel</span>
        <select
          value={carousel.id}
          onChange={(e) => onSelect(e.target.value)}
          className="max-w-[260px] rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:border-slate-500"
        >
          {carousels.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title || "Untitled"} ({c.slides.length})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + New
        </button>
        <button
          type="button"
          onClick={rename}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Rename
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={carousels.length <= 1}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          Delete
        </button>
        <span className="ml-auto text-xs text-slate-400">
          {carousels.length} saved
        </span>
      </div>

      {/* two-pane builder */}
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[420px] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
          <Editor
            carousel={carousel}
            onUpdateSlide={updateSlide}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
            onMoveSlide={moveSlide}
            onSetCaption={setCaption}
            onSetHashtags={setHashtags}
            onApplyParsed={applyParsed}
          />
        </div>

        <Preview
          slides={carousel.slides}
          registerRef={registerRef}
          onDownloadAll={handleDownloadAll}
          onDownloadOne={handleDownloadOne}
          exporting={exporting}
          progress={progress}
        />
      </div>
    </div>
  );
}
