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
  showChart?: boolean; // reserve the chart frame; when off, text is centered.
  // Defaults to whether an image is present (see valueHasChart()).
}

/** Whether a value slide should render its chart frame. */
export function valueHasChart(slide: ValueSlide): boolean {
  return slide.showChart ?? !!slide.imageDataUrl;
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
  id: string;
  title: string;
  slides: Slide[];
  caption: string; // the Instagram caption (with comment-trigger CTA)
  hashtags?: string; // suggested hashtags (for caption end or first comment)
}

// ---------------------------------------------------------------------------
// Growth-management model (Hook Bank, Content Calendar, Lead Magnet)
// ---------------------------------------------------------------------------

export type PillarId =
  | "orderflow"
  | "gex"
  | "breakdowns"
  | "mistakes"
  | "process";

export interface Pillar {
  id: PillarId;
  name: string;
  description: string;
}

export type ContentFormat = "reel" | "carousel" | "story";

export interface Hook {
  id: string;
  n?: number; // original number in the starter pack (1–15), for display
  text: string;
  pillar: PillarId;
  format: ContentFormat; // suggested format (reel vs carousel)
  used: boolean;
}

export interface CalendarDay {
  id: string;
  offset: number; // 0-based day index within the plan (Day 1 = offset 0)
  day: number; // 1-based day number (1–100)
  week: number; // plan week number
  phase: string; // e.g. "P1 · Ignition"
  weekdayLabel: string; // "Mon".."Sun" from the plan
  mainPost: string; // working title
  format: ContentFormat;
  pillar: string; // display label, e.g. "Trade breakdown (Proof)"
  hookLine?: string; // the on-screen hook / scroll-stopper line
  contentBrief?: string; // what to actually make
  cta?: string; // call to action
  stories: string;
  notes?: string; // weekly/monthly ops notes
  customContent?: string; // user's extra angle/example fed into the Claude prompt
  hookId?: string; // optional link to a Hook in the bank
  isLeadMagnet?: boolean; // this day pushes a comment-trigger lead magnet
  storiesOnly?: boolean; // no main feed post (story-only day)
  isCustom?: boolean; // user-inserted day (not from the 100-day plan)
  done: boolean;
}

export interface ContentPlan {
  startDate: string | null; // ISO yyyy-mm-dd of Day 1
  days: CalendarDay[];
}

export interface LeadMagnetIdea {
  id: string;
  title: string;
  description: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CopySnippet {
  id: string;
  label: string;
  text: string;
}

export interface ContentIdea {
  id: string;
  text: string;
  format: ContentFormat | "any"; // suggested format, or "any"
  createdAt: number;
}

export interface GrowthData {
  hooks: Hook[];
  plan: ContentPlan;
  ideas: ContentIdea[];
  leadMagnets: LeadMagnetIdea[];
  selectedLeadMagnetId: string;
  cheatSheet: ChecklistItem[]; // contents of the chosen resource
  snippets: CopySnippet[]; // comment trigger + auto-DM copy
  quickStart: ChecklistItem[]; // "this week" starter checklist
  rules: string[]; // "rules that matter more than the schedule" (reference)
}

export interface AppState {
  carousels: Carousel[];
  currentId: string;
  growth: GrowthData;
}
