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
export function parsePaste(input: string): ParsedPaste {
  const blocks = input
    .replace(/\r\n/g, "\n")
    .split(/^\s*---\s*$/m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

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
