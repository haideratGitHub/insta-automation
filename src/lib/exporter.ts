import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SLIDE_W, SLIDE_H } from "../constants";
import type { Slide } from "../types";

const PNG_OPTS = {
  width: SLIDE_W,
  height: SLIDE_H,
  pixelRatio: 1, // node is already 1080×1350 — we want exactly that, no upscale
  cacheBust: true,
} as const;

/** Wait for fonts + any <img> inside the node before capturing. */
async function ensureReady(node: HTMLElement): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

/**
 * Capture a single intrinsic-size slide node as a 1080×1350 PNG data URL.
 *
 * `html-to-image`'s first run can occasionally miss freshly-loaded fonts/images,
 * so we capture twice and keep the second result.
 */
export async function captureNode(node: HTMLElement): Promise<string> {
  await ensureReady(node);
  await toPng(node, PNG_OPTS); // warm-up throwaway
  return toPng(node, PNG_OPTS);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}${m}${day}`;
}

function triggerDownload(dataUrl: string, filename: string): void {
  saveAs(dataUrl, filename);
}

/** Download one slide as `slide-NN.png` (1-based index). */
export async function downloadSlide(
  node: HTMLElement,
  index: number,
): Promise<void> {
  const dataUrl = await captureNode(node);
  triggerDownload(dataUrl, `slide-${pad(index)}.png`);
}

/**
 * Export every slide in order and download a single zip:
 * `slide-01.png … slide-NN.png` (zero-padded so order is preserved).
 */
export async function downloadAll(
  slides: Slide[],
  refs: Map<string, HTMLElement>,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip();
  const total = slides.length;

  for (let i = 0; i < slides.length; i++) {
    const node = refs.get(slides[i].id);
    if (!node) continue;
    const dataUrl = await captureNode(node);
    const base64 = dataUrl.split(",")[1];
    zip.file(`slide-${pad(i + 1)}.png`, base64, { base64: true });
    onProgress?.(i + 1, total);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `carousel-${dateStamp()}.zip`);
}
