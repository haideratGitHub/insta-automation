import type { Slide, SlideType } from "../types";
import { genId } from "./id";

export interface ParsedPaste {
  slides: Slide[];
  caption?: string;
  hashtags?: string;
}

/**
 * Paste-mode mini-syntax → Slide[].
 *
 * Slides are separated by a line containing only `---`.
 * Within a block:
 *   - An optional first-line marker `[hook]` / `[value]` / `[cta]` sets the type.
 *     For `[value]`, any text after the marker becomes the kicker, e.g.
 *     `[value] 01 — gamma walls`.
 *   - The first non-special line becomes the headline.
 *   - `*phrase*`  → accent phrase (hook)
 *   - `(text)`    → subtext (hook)
 *   - `> text`    → CTA text (cta)
 *   - `~ text`    → footnote (cta)
 *   - any other line(s) → body (joined with newlines)
 *
 * Two non-slide blocks are also recognised (e.g. from the Claude prompt):
 *   - `[caption]`  → the Instagram caption (newlines preserved)
 *   - `[hashtags]` → suggested hashtags (whitespace collapsed to single spaces)
 *
 * When no marker is present, the first block defaults to a hook and the rest to
 * value slides.
 */
const TAG_LINE = /^\s*\[(hook|value|cta|caption|hashtags)\]/i;
const SEP_LINE = /^\s*-{3,}\s*$/;
const FENCE_LINE = /^\s*```/;

/**
 * Split pasted text into blocks. Primarily splits on a `---` separator line,
 * but ALSO starts a new block at every `[hook]/[value]/[cta]/[caption]/
 * [hashtags]` tag line — so it still works when the `---` lines get stripped
 * (e.g. copied from Claude's rendered markdown, where `---` renders as a rule).
 * Code-fence lines (```) are ignored.
 */
function splitBlocks(input: string): string[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const text = current.join("\n").trim();
    if (text.length) blocks.push(text);
    current = [];
  };

  for (const line of lines) {
    if (FENCE_LINE.test(line)) continue;
    if (SEP_LINE.test(line)) {
      flush();
      continue;
    }
    // a tag line starts a new block (unless the current block is still empty)
    if (TAG_LINE.test(line) && current.some((l) => l.trim() !== "")) {
      flush();
    }
    current.push(line);
  }
  flush();
  return blocks;
}

export function parsePaste(input: string): ParsedPaste {
  const blocks = splitBlocks(input);

  const slides: Slide[] = [];
  let caption: string | undefined;
  let hashtags: string | undefined;

  for (const block of blocks) {
    const capMatch = block.match(/^\[caption\]\s*([\s\S]*)$/i);
    if (capMatch) {
      caption = capMatch[1].trim();
      continue;
    }
    const hashMatch = block.match(/^\[hashtags\]\s*([\s\S]*)$/i);
    if (hashMatch) {
      hashtags = hashMatch[1].trim().replace(/\s+/g, " ");
      continue;
    }
    const slide = parseBlock(block, slides.length === 0);
    if (slide) slides.push(slide);
  }

  return { slides, caption, hashtags };
}

function parseBlock(block: string, isFirst: boolean): Slide | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  let type: SlideType;
  let kicker: string | undefined;

  const marker = lines[0].match(/^\[(hook|value|cta)\]\s*(.*)$/i);
  if (marker) {
    type = marker[1].toLowerCase() as SlideType;
    const rest = marker[2].trim();
    if (rest) kicker = rest;
    lines.shift();
  } else {
    type = isFirst ? "hook" : "value";
  }

  let headline = "";
  let accentPhrase: string | undefined;
  let subtext: string | undefined;
  let ctaText: string | undefined;
  let footnote: string | undefined;
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(">")) {
      ctaText = line.slice(1).trim();
      continue;
    }
    if (line.startsWith("~")) {
      footnote = line.slice(1).trim();
      continue;
    }
    const accentMatch = line.match(/^\*(.+)\*$/);
    if (accentMatch) {
      accentPhrase = accentMatch[1].trim();
      continue;
    }
    const subMatch = line.match(/^\((.+)\)$/);
    if (subMatch) {
      subtext = subMatch[1].trim();
      continue;
    }
    if (!headline) {
      headline = line;
      continue;
    }
    bodyLines.push(line);
  }

  const body = bodyLines.length ? bodyLines.join("\n") : undefined;
  const id = genId();

  if (type === "hook") {
    return { id, type, headline, accentPhrase, subtext };
  }
  if (type === "cta") {
    return { id, type, headline, body, ctaText: ctaText ?? "", footnote };
  }
  return { id, type: "value", headline, body, kicker };
}
