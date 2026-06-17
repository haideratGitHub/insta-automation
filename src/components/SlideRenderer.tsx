import type { Slide } from "../types";
import HookSlide from "./slides/HookSlide";
import ValueSlide from "./slides/ValueSlide";
import CtaSlide from "./slides/CtaSlide";

interface Props {
  slide: Slide;
  index: number;
  total: number;
}

/** Switches on slide.type and renders the matching layout. */
export default function SlideRenderer({ slide, index, total }: Props) {
  switch (slide.type) {
    case "hook":
      return <HookSlide slide={slide} index={index} total={total} />;
    case "value":
      return <ValueSlide slide={slide} index={index} total={total} />;
    case "cta":
      return <CtaSlide slide={slide} index={index} total={total} />;
    default:
      return null;
  }
}
