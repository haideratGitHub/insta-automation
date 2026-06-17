import { useState } from "react";
import type { AppState, Carousel, GrowthData } from "./types";
import { loadAppState } from "./lib/storage";
import { seedAppState } from "./lib/seed";
import { blankCarousel, carouselFromHook } from "./lib/carousel";
import { useSync } from "./hooks/useSync";
import CarouselStudio from "./components/CarouselStudio";
import SyncControl from "./components/SyncControl";
import CalendarView from "./views/CalendarView";
import IdeasView from "./views/IdeasView";
import HooksView from "./views/HooksView";
import LeadMagnetsView from "./views/LeadMagnetsView";

type View = "calendar" | "ideas" | "hooks" | "carousels" | "leadmagnets";

const TABS: { id: View; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "ideas", label: "Ideas" },
  { id: "hooks", label: "Hooks" },
  { id: "carousels", label: "Carousels" },
  { id: "leadmagnets", label: "Lead magnets" },
];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState() ?? seedAppState());
  const [view, setView] = useState<View>("calendar");

  // Persistence: localStorage autosave + optional cloud sync.
  const sync = useSync(state, setState);

  const current =
    state.carousels.find((c) => c.id === state.currentId) ??
    state.carousels[0] ??
    null;

  // --- carousel library ----------------------------------------------------
  const updateCarousel = (updated: Carousel) =>
    setState((s) => ({
      ...s,
      carousels: s.carousels.map((c) => (c.id === updated.id ? updated : c)),
    }));

  const selectCarousel = (id: string) =>
    setState((s) => ({ ...s, currentId: id }));

  const newCarousel = () =>
    setState((s) => {
      const c = blankCarousel(`Carousel ${s.carousels.length + 1}`);
      return { ...s, carousels: [...s.carousels, c], currentId: c.id };
    });

  const renameCarousel = (id: string, title: string) =>
    setState((s) => ({
      ...s,
      carousels: s.carousels.map((c) => (c.id === id ? { ...c, title } : c)),
    }));

  const deleteCarousel = (id: string) =>
    setState((s) => {
      const remaining = s.carousels.filter((c) => c.id !== id);
      const carousels = remaining.length
        ? remaining
        : [blankCarousel("Carousel 1")];
      const currentId =
        s.currentId === id ? carousels[0].id : s.currentId;
      return { ...s, carousels, currentId };
    });

  const createCarouselFromHook = (text: string) => {
    if (!text.trim()) return;
    const c = carouselFromHook(text);
    setState((s) => ({
      ...s,
      carousels: [...s.carousels, c],
      currentId: c.id,
    }));
    setView("carousels");
  };

  // --- growth --------------------------------------------------------------
  const setGrowth = (fn: (g: GrowthData) => GrowthData) =>
    setState((s) => ({ ...s, growth: fn(s.growth) }));

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      {/* app header + tabs */}
      <header className="flex items-center gap-6 border-b border-slate-200 bg-white px-5 py-2.5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-bold tracking-tight">CarouselForge</h1>
          <span className="hidden text-xs text-slate-400 sm:inline">
            @hayeder.trades growth desk
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setView(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === t.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto">
          <SyncControl sync={sync} />
        </div>
      </header>

      {/* active view */}
      <main className="flex min-h-0 flex-1">
        {view === "calendar" && (
          <CalendarView
            growth={state.growth}
            setGrowth={setGrowth}
            onCreateCarousel={createCarouselFromHook}
          />
        )}
        {view === "ideas" && (
          <IdeasView
            growth={state.growth}
            setGrowth={setGrowth}
            onCreateCarousel={createCarouselFromHook}
          />
        )}
        {view === "hooks" && (
          <HooksView
            growth={state.growth}
            setGrowth={setGrowth}
            onCreateCarousel={createCarouselFromHook}
          />
        )}
        {view === "carousels" && (
          <CarouselStudio
            carousels={state.carousels}
            current={current}
            onChange={updateCarousel}
            onSelect={selectCarousel}
            onNew={newCarousel}
            onRename={renameCarousel}
            onDelete={deleteCarousel}
          />
        )}
        {view === "leadmagnets" && (
          <LeadMagnetsView growth={state.growth} setGrowth={setGrowth} />
        )}
      </main>
    </div>
  );
}
