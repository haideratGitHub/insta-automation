import type {
  AppState,
  Carousel,
  CalendarDay,
  ContentFormat,
  ContentPlan,
  GrowthData,
  Hook,
  Pillar,
  PillarId,
  TiktokAction,
  TiktokData,
  TiktokDay,
  TiktokPlan,
} from "../types";
import { genId } from "./id";
import { CALENDAR_100 } from "./calendar100";
import { TIKTOK_100 } from "./tiktok100";

export const PILLARS: Pillar[] = [
  {
    id: "orderflow",
    name: "Orderflow basics",
    description: "Your discovery layer — pulls beginners in.",
  },
  {
    id: "gex",
    name: "GEX / options flow",
    description: "Your differentiator — almost nobody teaches this well.",
  },
  {
    id: "breakdowns",
    name: "Trade breakdowns",
    description: "Your proof layer.",
  },
  {
    id: "mistakes",
    name: "Mistakes & psychology",
    description: "Your most shareable content.",
  },
  {
    id: "process",
    name: "Process & system",
    description: "Your save-able authority content.",
  },
];

export function pillarName(id: PillarId): string {
  return PILLARS.find((p) => p.id === id)?.name ?? id;
}

// Hooks 1–9 work best as Reels; 10–15 (mistakes + process) as Carousels.
const HOOK_SEED: { n: number; text: string; pillar: PillarId }[] = [
  { n: 1, text: "I ignored order flow for 2 years. Here's exactly what it cost me.", pillar: "orderflow" },
  { n: 2, text: "Support and resistance is lying to you. Here's what actually moves price.", pillar: "orderflow" },
  { n: 3, text: "If you only ever learn one order flow concept, make it this one.", pillar: "orderflow" },
  { n: 4, text: "Why NQ rejects the same level every single morning — and no, it's not random.", pillar: "gex" },
  { n: 5, text: "Dealers told you where price would stop today. You just didn't know how to read it.", pillar: "gex" },
  { n: 6, text: "The 'gamma flip' explained in 60 seconds — without the math degree.", pillar: "gex" },
  { n: 7, text: "Everyone watched NQ dump today. The tape called it 20 minutes early — frame by frame.", pillar: "breakdowns" },
  { n: 8, text: "+4R on NQ. The entry everyone scrolled past, broken down step by step.", pillar: "breakdowns" },
  { n: 9, text: "I almost skipped this trade. Then the order flow did this.", pillar: "breakdowns" },
  { n: 10, text: "The order flow mistake that blew up my first funded account.", pillar: "mistakes" },
  { n: 11, text: "You're not losing because of your strategy. You're losing because of this.", pillar: "mistakes" },
  { n: 12, text: "3 order flow 'signals' that are actually traps — I fell for all of them.", pillar: "mistakes" },
  { n: 13, text: "My exact pre-market routine before I touch NQ. Steal it.", pillar: "process" },
  { n: 14, text: "How I journal every trade in under 5 minutes (and why it doubled my consistency).", pillar: "process" },
  { n: 15, text: "The 1-page checklist I run before every single entry.", pillar: "process" },
];

function seedHooks(): Hook[] {
  return HOOK_SEED.map((h) => ({
    id: genId(),
    n: h.n,
    text: h.text,
    pillar: h.pillar,
    format: h.n >= 10 ? "carousel" : "reel",
    used: false,
  }));
}

function mapFormat(raw: string): ContentFormat {
  const s = raw.toLowerCase();
  if (s.startsWith("carousel")) return "carousel";
  if (s.startsWith("story")) return "story";
  return "reel";
}

/** Build the 100-day content plan from the imported CSV data. */
export function seedPlan(): ContentPlan {
  const days: CalendarDay[] = CALENDAR_100.map((r, i) => {
    const format = mapFormat(r.format);
    return {
      id: genId(),
      offset: i,
      day: r.day,
      week: r.week,
      phase: r.phase,
      weekdayLabel: r.weekday,
      mainPost: r.workingTitle,
      format,
      pillar: r.pillar,
      hookLine: r.hookLine || undefined,
      contentBrief: r.contentBrief || undefined,
      cta: r.cta || undefined,
      stories: r.stories,
      notes: r.notes || undefined,
      storiesOnly: format === "story",
      isLeadMagnet: /^comment/i.test(r.cta),
      done: false,
    };
  });
  return { startDate: CALENDAR_100[0]?.date ?? null, days };
}

function mapTiktokAction(raw: string): TiktokAction {
  const s = raw.toLowerCase();
  if (s.startsWith("rest")) return "rest";
  if (s.startsWith("tiktok-native")) return "native";
  return "repost";
}

export function seedTiktokPlan(): TiktokPlan {
  const days: TiktokDay[] = TIKTOK_100.map((r, i) => ({
    id: genId(),
    offset: i,
    day: r.day,
    week: r.week,
    phase: r.phase,
    weekdayLabel: r.weekday,
    action: mapTiktokAction(r.action),
    content: r.content,
    note: r.note || undefined,
    overlay: r.overlay || undefined,
    done: false,
  }));
  return { startDate: TIKTOK_100[0]?.date ?? null, days };
}

export function seedTiktok(): TiktokData {
  return {
    plan: seedTiktokPlan(),
    ideas: [],
    rules: [
      "Warm-up (first ~6 weeks): ~4 posts/week, NO links in bio or caption yet — build trust first.",
      "Hook in the first 1 second; ride a trending sound on every post.",
      "Reposts: use the clean iPhone export (no IG watermark) with a fresh TikTok caption.",
      "Spend ~15 min/day commenting on niche creators; check Account Status for flags.",
      "From P3 (~week 11) it's safe to add your bio link to IG / Discord.",
    ],
  };
}

export function seedGrowth(): GrowthData {
  const hooks = seedHooks();
  const cheatId = genId();
  return {
    hooks,
    plan: seedPlan(),
    ideas: [],
    tiktok: seedTiktok(),
    leadMagnets: [
      {
        id: cheatId,
        title: "The Order Flow Cheat Sheet (1-page PDF)",
        description:
          "Buildable in an afternoon. The 5 order flow signals you actually trade, a mini footprint diagram for each, your 3-question pre-entry checklist, and where to learn more.",
      },
      {
        id: genId(),
        title: "GEX Levels Quick-Start",
        description: "How to find gamma walls and what to do at each.",
      },
      {
        id: genId(),
        title: "Pre-Market Routine Checklist",
        description: "The exact steps you run before NY open.",
      },
    ],
    selectedLeadMagnetId: cheatId,
    cheatSheet: [
      { id: genId(), done: false, text: "The 5 order flow signals you actually trade (absorption, exhaustion, delta divergence, stacked imbalances, trapped traders) — one line each" },
      { id: genId(), done: false, text: 'A simple "what it looks like on the footprint" mini-diagram for each' },
      { id: genId(), done: false, text: "Your 3-question pre-entry checklist" },
      { id: genId(), done: false, text: "One line: where to learn more (your page / newsletter)" },
    ],
    snippets: [
      {
        id: genId(),
        label: "Comment trigger (end of Reel + in caption)",
        text: "I turned this into a free 1-page cheat sheet. Comment TAPE and I'll send it straight to your DMs. 👇 (Follow first so it doesn't land in requests.)",
      },
      {
        id: genId(),
        label: "Auto-DM that gets sent",
        text: "Here's your Order Flow Cheat Sheet 👇 [link]\n\nThis is the exact framework I use to read the tape on NQ every morning. If you want the daily breakdowns where I apply it live, you're in the right place — I post one every session I trade.\n\nQuick one: what's the part of order flow you find hardest right now? Reply and I'll point you to a post on it.",
      },
    ],
    quickStart: [
      { id: genId(), done: false, text: "Build the Order Flow Cheat Sheet PDF." },
      { id: genId(), done: false, text: "Set up your carousel template (use the Carousels tab)." },
      { id: genId(), done: false, text: "Post Mon–Sat per Week 1. Don't skip the daily Stories." },
      { id: genId(), done: false, text: "Comment on 5–10 bigger accounts every day before you post." },
    ],
    rules: [
      "Post when your followers are online (check Insights). ~60% of a post's reach happens in the first 60 minutes.",
      'Every carousel ends with "Save this for your next session" — saves are a top ranking signal.',
      "Reply to every comment in the first hour with a real sentence (drives the conversation-depth signal).",
      "Spend 20–30 min/day commenting thoughtfully on bigger order flow / futures accounts. This is half your growth.",
    ],
  };
}

export function seedDefaultCarousel(): Carousel {
  return {
    id: genId(),
    title: "Why NQ rejects the same level",
    slides: [
      {
        id: genId(),
        type: "hook",
        headline: "Why does NQ reject the same level every morning?",
        accentPhrase: "same level",
        subtext: "(and no, it's not random)",
      },
      {
        id: genId(),
        type: "value",
        kicker: "01 — gamma walls",
        headline: "Dealers defend price at gamma levels.",
        body: "Price stalls where dealers are forced to hedge — that's your level.",
      },
      {
        id: genId(),
        type: "cta",
        headline: "Want my order flow cheat sheet?",
        body: "The exact 1-page framework I read on NQ every session.",
        ctaText: 'Comment "TAPE" below ↓',
        footnote: "Save this for your next session",
      },
    ],
    caption:
      'The same level rejects NQ every morning — here\'s the order-flow reason why.\n\nComment "TAPE" and I\'ll send you the 1-page cheat sheet. 📩',
  };
}

export function seedAppState(): AppState {
  const carousel = seedDefaultCarousel();
  return {
    carousels: [carousel],
    currentId: carousel.id,
    growth: seedGrowth(),
  };
}
