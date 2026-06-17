import type { AppState, Carousel } from "../types";
import { genId } from "./id";
import { seedGrowth, seedPlan } from "./seed";

/**
 * Upgrade older saved state in place:
 * - replace a pre-100-day plan (or one missing the richer fields) with the
 *   current 100-day plan, preserving any `done` flags by day number.
 */
function migrate(state: AppState): AppState {
  const days = state.growth?.plan?.days ?? [];
  const isCurrent = days.length === 100 && days[0] && "phase" in days[0];
  if (!isCurrent) {
    const doneByDay = new Map<number, boolean>();
    days.forEach((d) => {
      if (typeof d.day === "number" && d.done) doneByDay.set(d.day, true);
    });
    const fresh = seedPlan();
    fresh.days.forEach((d) => {
      if (doneByDay.get(d.day)) d.done = true;
    });
    state.growth.plan = fresh;
  }
  return state;
}

const KEY = "carouselforge:appstate:v1";
const LEGACY_KEY = "carouselforge:carousel:v1"; // single-carousel save from v1

let timer: ReturnType<typeof setTimeout> | undefined;

/** Debounced autosave of the whole app state to localStorage. */
export function saveAppStateDebounced(state: AppState, delay = 400): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private-mode errors — autosave is best-effort
    }
  }, delay);
}

/** Restore app state, migrating an old single-carousel save if present. */
export function loadAppState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.carousels) && parsed.growth) {
        return migrate(parsed);
      }
    }
  } catch {
    // fall through to migration / null
  }

  // Migrate a legacy { slides, caption } carousel into the new shape.
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const c = JSON.parse(legacy);
      if (c && Array.isArray(c.slides)) {
        const carousel: Carousel = {
          id: genId(),
          title: "My first carousel",
          slides: c.slides,
          caption: typeof c.caption === "string" ? c.caption : "",
        };
        localStorage.removeItem(LEGACY_KEY);
        return {
          carousels: [carousel],
          currentId: carousel.id,
          growth: seedGrowth(),
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}
