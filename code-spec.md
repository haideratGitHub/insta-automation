# Build Spec — "CarouselForge" (personal Instagram carousel generator)

Paste this whole file into Claude Code as the build brief. Build it step by step, confirm the app runs after scaffolding, then iterate on layouts.

---

## 1. What we're building

A **personal, single-user, client-side web app** that turns typed content into on-brand Instagram carousel slides and exports them as ready-to-upload PNG images (1080 × 1350px). No backend, no database, no login, no third-party API keys, no recurring cost. It runs locally with `npm run dev` and can be deployed free to Vercel or Netlify.

**The user's workflow:**

1. Type or paste content for a carousel (a hook, a few value slides, a CTA).
2. Optionally drag a chart screenshot onto a value slide.
3. See every slide render live in the user's brand style.
4. Click "Download all" → get a zip of correctly-ordered 1080×1350 PNGs.
5. Upload those PNGs to Instagram manually (out of scope for this app).

**Explicitly out of scope (do NOT build):** Instagram API / auto-posting, any backend or server, user accounts, paid services. Keep everything in the browser and free.

---

## 2. Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS** for styling
- **`html-to-image`** (`toPng`) for slide → PNG export
- **`jszip`** + **`file-saver`** for "download all as zip"
- **Google Fonts**: Space Grotesk (headlines) + Inter (body)

No other dependencies. No backend frameworks.

---

## 3. Brand theme (single source of truth)

Create `src/theme.ts` exporting one object so the whole look is editable in one place:

```ts
export const theme = {
	bg: "#0B0E11", // slide background (near-black, matches trading charts)
	surface: "#161B22", // chart frame / card surfaces
	accent: "#16C784", // "profit green" — key phrase, swipe arrow, CTA pill
	accentText: "#04342C", // dark green text used ON the accent pill
	text: "#FFFFFF", // headlines
	muted: "#8B949E", // body / secondary text
	loss: "#FF5C5C", // use sparingly (mistake/loss framing)
	level: "#E3B341", // optional yellow "level line" accent
	handle: "@hayederfx",
	fontHead: "'Space Grotesk', sans-serif",
	fontBody: "'Inter', sans-serif",
};
```

Load both fonts via a `<link>` to fonts.googleapis.com in `index.html` (weights: Space Grotesk 500/700, Inter 400/500).

---

## 4. Data model

Create `src/types.ts`:

```ts
export type SlideType = "hook" | "value" | "cta";

export interface BaseSlide {
	id: string;
	type: SlideType;
}

export interface HookSlide extends BaseSlide {
	type: "hook";
	headline: string; // the scroll-stopper
	accentPhrase?: string; // substring of headline to color in accent green
	subtext?: string; // small line under headline, e.g. "(and no, it's not random)"
}

export interface ValueSlide extends BaseSlide {
	type: "value";
	kicker?: string; // small top-left label, e.g. "01 — gamma walls"
	headline: string;
	body?: string;
	imageDataUrl?: string; // optional chart screenshot, stored as a data URL
}

export interface CtaSlide extends BaseSlide {
	type: "cta";
	headline: string;
	body?: string;
	ctaText: string; // e.g. 'Comment "TAPE" below ↓'
	footnote?: string; // e.g. "Save this for your next session"
}

export type Slide = HookSlide | ValueSlide | CtaSlide;

export interface Carousel {
	slides: Slide[];
	caption: string; // the Instagram caption (with comment-trigger CTA)
}
```

The slide **counter** ("3 / 6") shown on each slide is computed from position in the array, not stored.

---

## 5. UI layout (two panes)

A full-height two-column layout:

**Left pane — Editor.** Two input modes via a toggle:

- **Form mode (default):** A list of slide cards. Each card lets the user pick the slide type, fill its fields, and (for value slides) drag-and-drop or click-to-upload a chart image. Buttons to add a slide, delete a slide, and reorder slides (drag handle or up/down arrows). A separate field at the bottom for the IG caption with a "Copy caption" button.
- **Paste mode:** One big `<textarea>` where the user writes the whole carousel in a simple text syntax (see §6), plus a "Parse → preview" button that converts it into the slide model and switches to form mode for fine-tuning.

**Right pane — Live preview.** Renders every slide stacked vertically using the real slide components and theme, each scaled down to fit the pane (see §7 for the scaling rule — critical). A top toolbar with: **Download all (.zip)**, and small per-slide download buttons on hover. Show the count and a tiny note "exports at 1080 × 1350".

Keep the chrome of the app itself clean and neutral (light or system UI is fine) — only the _slides_ use the dark brand theme.

---

## 6. Paste-mode mini-syntax

Slides separated by a line containing only `---`. First non-empty line of a block is the headline; subsequent lines are parsed by simple prefixes. Document this in a small "Format help" popover.

```
[hook]
Why does NQ reject the same level every morning?
*same level*               <- text inside *...* becomes the accent phrase
(and no, it's not random)  <- a line in (...) becomes subtext
---
[value] 01 — gamma walls    <- "[value]" + optional kicker after it
Dealers defend price at gamma levels.
Price stalls where dealers are forced to hedge — that's your level.
---
[cta]
Want my order flow cheat sheet?
The exact 1-page framework I read on NQ every session.
> Comment "TAPE" below ↓     <- line starting ">" is the CTA text
~ Save this for your next session   <- line starting "~" is the footnote
```

The parser maps `[hook]/[value]/[cta]` to slide types and fills fields by these rules. Images can't be added in paste mode — they're attached afterward in form mode.

---

## 7. The render-and-export mechanic (CRITICAL — get this exactly right)

This is the part that usually goes wrong. The goal: **crisp, full-resolution 1080 × 1350 PNGs**, while the preview shows the slides small enough to fit the pane.

Rules:

1. **Each slide component renders at its true intrinsic size: `width: 1080px; height: 1350px`.** All font sizes, padding, etc. are designed at this real pixel scale (so headline ~64–80px, body ~30–34px, etc. — these are _export_ pixels, not screen pixels).
2. **Scaling for preview goes on a WRAPPER element, never on the slide node itself.** Wrap each 1080×1350 slide node in a container with `transform: scale(0.3); transform-origin: top left;` and give the wrapper the scaled dimensions (`width: 324px; height: 405px`) so layout flows correctly. `html-to-image` serializes the slide node at its intrinsic size and ignores ancestor transforms, so capturing the inner node yields a true 1080×1350 image. (If you put the scale on the slide node directly, the export comes out scaled/blurry — don't.)
3. **Hold a `ref` to each slide's intrinsic 1080×1350 node** (a `Map<slideId, HTMLElement>`), and export from those refs.
4. **Before exporting, await `document.fonts.ready`** so Space Grotesk/Inter are loaded into the capture. Also ensure any uploaded image has finished loading. `html-to-image`'s first capture can occasionally miss assets — do one throwaway `toPng` call on warm-up (or simply capture each slide twice and keep the second) to be safe.
5. **Export per slide:** `await htmlToImage.toPng(node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true })`.
6. **Download all:** loop slides in order → `toPng` each → add to a `JSZip` instance as `slide-01.png`, `slide-02.png`, … (zero-padded so order is preserved) → `zip.generateAsync({type:'blob'})` → `saveAs(blob, 'carousel-YYYYMMDD.zip')`. Provide per-slide single-PNG downloads too.

Put this logic in `src/lib/exporter.ts`.

---

## 8. Image (chart screenshot) handling

- Value slides accept an image via drag-drop or file picker.
- Read the file with `FileReader.readAsDataURL` and store the **data URL** on the slide (`imageDataUrl`). Use data URLs (not object URLs or remote URLs) — they avoid CORS tainting that would otherwise make `html-to-image` fail.
- Render the image inside the framed chart slot with `object-fit: cover; width:100%; height:100%;` and the theme's `surface` background + a 1px dashed `accent` border when empty (showing a "drop your chart here" hint).

---

## 9. Slide layouts to ship in v1

Match this design (it's the user's established look):

- **Hook:** dark `bg`. Top row: `handle` (accent, small) left, counter (muted) right. Center: large headline (white, ~72px, weight 700) with `accentPhrase` colored in `accent`; optional `subtext` (muted) below. Bottom-left: "swipe →" in accent.
- **Value:** top row: `kicker` (accent, small) left, counter right. Headline (white, ~52px). Then the chart frame (the image slot, ~40% of slide height). Then `body` (muted, ~32px).
- **CTA:** top row: handle + counter. Headline (white, ~64px) + `body` (muted). An accent **pill**: `accent` background, `accentText` color, rounded, containing `ctaText`. Bottom: a star icon + `footnote` (muted).

All slides: generous padding (~64px), one idea per slide, sentence case, the dark theme. Keep components in `src/components/slides/` (`HookSlide.tsx`, `ValueSlide.tsx`, `CtaSlide.tsx`) plus a `SlideRenderer.tsx` that switches on `type`.

---

## 10. Persistence

Autosave the current `Carousel` and the `theme` to `localStorage` on every change (debounced), and restore on load, so a tab refresh never loses work. Add a "New carousel" button to clear. (This is the user's own deployed app, so `localStorage` is appropriate and expected here.)

---

## 11. Suggested file structure

```
src/
  main.tsx
  App.tsx
  theme.ts
  types.ts
  lib/
    exporter.ts        // toPng + JSZip "download all"
    parser.ts          // paste-mode syntax → Slide[]
    storage.ts         // localStorage save/load (debounced)
  components/
    Editor.tsx         // left pane (form + paste modes)
    SlideForm.tsx      // single editable slide card
    Preview.tsx        // right pane, scaled slide wrappers
    SlideRenderer.tsx
    slides/
      HookSlide.tsx
      ValueSlide.tsx
      CtaSlide.tsx
```

---

## 12. Acceptance criteria (the build is done when…)

- `npm install && npm run dev` starts the app with no errors.
- Typing a headline updates the matching slide in the preview instantly.
- Exported PNGs are **exactly 1080 × 1350**, with fonts and colors rendered correctly and text crisp (not blurry/scaled).
- A chart image dropped on a value slide fills the frame and appears in the export.
- "Download all" produces a zip of PNGs named `slide-01.png … slide-NN.png` in carousel order.
- Per-slide download works.
- Paste-mode syntax parses correctly into hook/value/cta slides.
- Refreshing the tab restores the current carousel from `localStorage`.
- No backend, no API keys, no Instagram integration anywhere in the code.

---

## 13. Phase 2 ideas (build only after v1 works — do not start these now)

- A theme switcher (multiple brand presets).
- Extra layouts: a big-stat slide, a quote slide, a "lessons learned" list slide.
- Export a single multi-page PDF (some schedulers accept PDF carousels).
- Optional AI assist: a button that sends a rough trade note to an LLM (user pastes their own API key, stored in `localStorage`) and gets back slide-by-slide text to auto-fill the form. Keep it opt-in because it adds a key + per-call cost.

```

```
