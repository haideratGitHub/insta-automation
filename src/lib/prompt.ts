import type { CalendarDay, TiktokDay } from "../types";

const TIKTOK_ACTION_LABEL: Record<string, string> = {
  repost: "Repost a clean (no-watermark) export of an existing breakdown",
  native: "TikTok-native short — lean into a trend/sound, raw and fast",
  rest: "Rest / engage / review day",
};

/**
 * Build a Claude prompt for a TikTok day. Produces a ready-to-film short-form
 * script (hook + beats + CTA), a caption, and a few hashtags.
 */
export function buildTiktokScriptPrompt(day: TiktokDay): string {
  const content = (day.content || "").trim() || "(untitled)";
  const note = (day.note || "").trim() || "(none)";
  const overlay = (day.overlay || "").trim();
  const phase = (day.phase || "").trim() || "(n/a)";
  const actionLabel = TIKTOK_ACTION_LABEL[day.action] ?? day.action;
  const custom =
    (day.customContent || "").trim() ||
    "(none — use your own expertise; research if it helps)";

  return `You are a short-form video scriptwriter and order-flow trading educator writing for @hayeder.trades — a trader who trades NQ (Nasdaq-100 futures) using order flow and GEX (gamma exposure / options-dealer positioning), now growing on TikTok.

AUDIENCE: retail futures & day traders on TikTok's For You feed, beginner→intermediate, fast scrollers.
VOICE: punchy, plain English, confident, no hype. Talk like a real trader, not a guru.

# TASK
Write a ready-to-film TikTok script for the day below: a 1-second hook, a tight body, and a CTA — then a caption and hashtags. Total runtime ~15–40 seconds. Output plain text only (no markdown headers, no code fences).

# THE DAY
- Format: ${actionLabel}
- Topic / working title: ${content}
- How-to note: ${note}${overlay ? `\n- Ops note for today: ${overlay}` : ""}
- Plan phase: ${phase}

# MY CUSTOM ANGLE (build around this first)
${custom}

# RESEARCH
If a concept would be sharper or more accurate with current info, do a quick web search (how dealer gamma hedging moves price, CVD/absorption/value-area basics, etc.). Keep claims correct and evergreen; don't invent specific price levels, dates, or P&L unless I gave them.

# RULES
- Hook (first 1 second / first line): a bold, specific, scroll-stopping line. No "in this video".
- Keep one idea. Short spoken sentences. Concrete and visual — say what it looks like on the chart/tape.
- If today is a "rest / engage / review" day, instead give me a 15-minute engagement + review checklist for the day (no script).
- Warm-up phases: no links/promos; just teach and build trust.

# OUTPUT (plain text, in this order)
HOOK (0–1s):
<one line>

SCRIPT (spoken, ~15–40s):
<3–6 short beats, one per line>

ON-SCREEN TEXT:
<2–4 short overlay captions to put on screen>

CTA:
<one line — follow / comment, matched to the phase>

CAPTION:
<1–2 lines for the TikTok caption>

HASHTAGS:
<8–15 lowercase hashtags, space-separated>

SOUND IDEA:
<one suggestion for the kind of trending sound/format to use>`;
}

/**
 * Build a Claude prompt for a carousel day. Pasting the prompt into Claude
 * yields content in the exact CarouselForge paste syntax (see lib/parser.ts),
 * which the user pastes straight into the Carousels → Paste-mode input.
 */
export function buildCarouselPrompt(day: CalendarDay): string {
  const title = (day.mainPost || "").trim() || "(untitled)";
  const hook = (day.hookLine || "").trim() || title;
  const cta = (day.cta || "").trim() || "Save this for your next session";
  const brief = (day.contentBrief || "").trim() || "(none provided)";
  const stories = (day.stories || "").trim() || "(none)";
  const pillar = (day.pillar || "").trim() || "(n/a)";
  const phase = (day.phase || "").trim() || "(n/a)";
  const custom =
    (day.customContent || "").trim() ||
    "(none — use your own expertise; research if it helps)";

  return `You are an expert Instagram carousel copywriter and order-flow trading educator writing for @hayeder.trades — a trader who trades NQ (Nasdaq-100 futures) using order flow and GEX (gamma exposure / options-dealer positioning).

AUDIENCE: retail futures & day traders, beginner→intermediate, scrolling Instagram.
VOICE: sharp, confident, plain English, teacher energy. No hype, no emojis in slide text, sentence case, one idea per slide. Make it save-worthy and shareable.

# TASK
Write ONE Instagram carousel (6–8 slides total) from the brief below, then output it in the exact "CarouselForge paste syntax" defined under OUTPUT FORMAT. The result must be paste-ready: output ONLY the syntax block — no preamble, no explanation, no code fences.

# BRIEF
- Working title: ${title}
- Core hook (slide 1 must deliver this): ${hook}
- Content pillar / angle: ${pillar}
- Plan phase: ${phase}
- What to cover (content brief): ${brief}
- Final call-to-action (use verbatim on the CTA slide): ${cta}
- Companion Stories idea (context only — do NOT put it in the carousel): ${stories}

# MY CUSTOM CONTENT (highest priority — build the carousel around this)
${custom}

# RESEARCH
Before writing, if any concept, definition, or mechanic would be sharper or more accurate with current information, run a quick web search (e.g., how dealer gamma hedging pushes price, positive vs negative gamma regimes, footprint / CVD / absorption basics, value-area mechanics). Requirements:
- Keep every claim correct and evergreen. Teach durable mechanics, not time-sensitive predictions.
- Do NOT invent specific price levels, dates, or P&L numbers unless I gave them in MY CUSTOM CONTENT.
- Translate any jargon you introduce into plain English on the slide itself.

# WRITING RULES
- Slide 1 [hook]: a scroll-stopper under ~12 words. Bold, specific, slightly contrarian promise. Pick ONE 1–3 word phrase from the headline to highlight (accent color). Optionally one short subtext line.
- Middle slides [value]: ONE concept per slide, ~10–30 words. Give each a short kicker like "01 — gamma walls". Sequence logically: hook → why it happens → how it works → a concrete example → the takeaway. Be concrete and visual — describe what it looks like on the chart / tape.
- Final slide [cta]: restate the payoff in one line, then drive the action. Put the action verbatim in the pill, plus a short "save this" footnote.
- Use 1 hook + 4–6 value + 1 cta. Sentence case throughout.
- Caption (the [caption] block): 3–6 short lines that boost the post organically. Open with a scroll-stopping line, give one line of value/context, then a clear COMMENT-TRIGGER call to action that matches the brief's CTA (e.g., 'Comment "TAPE" and I'll DM you the cheat sheet'). End with a soft "save this / follow for daily NQ order flow" nudge. A few emojis are fine in the caption only (never on slides). Encourage saves, shares and comments — these drive reach.
- Hashtags (the [hashtags] block): 12–20 lowercase hashtags, space-separated, no commas. Mix tiers for discovery: a few broad (#trading #stockmarket #investing), several mid niche (#daytrading #futurestrading #priceaction #orderflow), and several specific/long-tail (#nq #nasdaqfutures #gex #gammaexposure #footprintchart #tapereading). No banned/spammy tags; keep them genuinely relevant.

# OUTPUT FORMAT — CarouselForge paste syntax (return EXACTLY this shape)
- Separate every slide with a line containing only three dashes: ---
- Each slide's FIRST line is its type tag: [hook], [value], or [cta]. Any text after [value] on that same line is the slide's kicker.
- Inside [hook]: a line written as *phrase* sets the accent (highlighted) phrase; a line written as (text) sets the subtext.
- Inside [cta]: a line starting with > is the button/pill text; a line starting with ~ is the footnote.
- After the cta slide, add a [caption] block (the Instagram caption, line breaks allowed) and a [hashtags] block (space-separated hashtags). These are NOT slides — they fill the post's caption and hashtag fields.
- Every other line is content — the first such line is the slide headline, the rest are the body.

Example shape (DO NOT reuse this copy — it only demonstrates the format):
[hook]
Your stop-loss isn't the problem
*the problem*
(it's where you put it)
---
[value] 01 — liquidity
Price hunts resting orders.
Stops cluster above the highs and below the lows — that's the fuel.
---
[value] 02 — the tell
Watch for the sweep, then the reclaim.
Aggression into a level that fails = trapped traders about to puke.
---
[cta]
Trade where the stops are, not where they get hit.
The full read is in my free cheat sheet.
> Comment "TAPE" and I'll DM it
~ Save this for your next session
---
[caption]
Your stops aren't getting unlucky — they're getting hunted. 🎯

Here's how to read where liquidity sits before you enter, so you stop donating to the move.

Comment "TAPE" and I'll DM you the free 1-page cheat sheet. Save this for your next session, and follow for daily NQ order flow.
---
[hashtags]
#nq #orderflow #daytrading #futurestrading #priceaction #tapereading #gex #nasdaqfutures #trading #scalping #liquidity #daytrader

Now write the real carousel for the brief above and output ONLY the paste syntax (slides, then [caption], then [hashtags]).`;
}
