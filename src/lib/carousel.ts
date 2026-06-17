import type { Carousel, Slide, SlideType } from "../types";
import { genId } from "./id";

/** A fresh empty slide of the given type. */
export function makeSlide(type: SlideType): Slide {
  const id = genId();
  switch (type) {
    case "hook":
      return { id, type, headline: "New hook headline", accentPhrase: "" };
    case "value":
      return { id, type, headline: "New value point", body: "" };
    case "cta":
      return { id, type, headline: "New CTA", ctaText: "" };
  }
}

function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 44 ? t.slice(0, 44).trimEnd() + "…" : t || "Untitled carousel";
}

/** A blank carousel with a single hook slide. */
export function blankCarousel(title = "Untitled carousel"): Carousel {
  return { id: genId(), title, slides: [makeSlide("hook")], caption: "" };
}

/** Seed a carousel from a hook line — the hook text becomes the hook slide. */
export function carouselFromHook(text: string, title?: string): Carousel {
  return {
    id: genId(),
    title: title ? titleFrom(title) : titleFrom(text),
    slides: [{ id: genId(), type: "hook", headline: text, accentPhrase: "" }],
    caption: "",
  };
}
