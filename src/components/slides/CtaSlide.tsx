import type { CtaSlide as CtaSlideData } from "../../types";
import { theme } from "../../theme";

interface Props {
  slide: CtaSlideData;
  index: number;
  total: number;
}

export default function CtaSlide({ slide, index, total }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.fontBody,
        padding: 80,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* top row: handle + counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: theme.fontHead,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: 0.5,
        }}
      >
        <span style={{ color: theme.accent }}>{theme.handle}</span>
        <span style={{ color: theme.muted }}>
          {index + 1} / {total}
        </span>
      </div>

      {/* center: headline + body + accent pill */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: theme.fontHead,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}
        >
          {slide.headline}
        </h2>
        {slide.body ? (
          <p
            style={{
              margin: 0,
              marginTop: 28,
              color: theme.muted,
              fontSize: 33,
              lineHeight: 1.38,
              whiteSpace: "pre-line",
            }}
          >
            {slide.body}
          </p>
        ) : null}
        {slide.ctaText ? (
          <div
            style={{
              marginTop: 56,
              background: theme.accent,
              color: theme.accentText,
              borderRadius: 999,
              padding: "26px 48px",
              fontFamily: theme.fontHead,
              fontWeight: 700,
              fontSize: 36,
              lineHeight: 1.1,
            }}
          >
            {slide.ctaText}
          </div>
        ) : null}
      </div>

      {/* bottom: star + footnote */}
      {slide.footnote ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: theme.muted,
            fontSize: 30,
          }}
        >
          <span style={{ color: theme.level, fontSize: 34 }}>★</span>
          {slide.footnote}
        </div>
      ) : null}
    </div>
  );
}
