import type { ReactNode } from "react";
import type { HookSlide as HookSlideData } from "../../types";
import { theme } from "../../theme";

interface Props {
  slide: HookSlideData;
  index: number;
  total: number;
}

/** Color the first case-insensitive occurrence of `phrase` inside `headline`. */
function renderHeadline(headline: string, phrase?: string): ReactNode {
  if (!phrase) return headline;
  const idx = headline.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return headline;
  const before = headline.slice(0, idx);
  const match = headline.slice(idx, idx + phrase.length);
  const after = headline.slice(idx + phrase.length);
  return (
    <>
      {before}
      <span style={{ color: theme.accent }}>{match}</span>
      {after}
    </>
  );
}

export default function HookSlide({ slide, index, total }: Props) {
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

      {/* center: headline + subtext */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: theme.fontHead,
            fontWeight: 700,
            fontSize: 76,
            lineHeight: 1.08,
            letterSpacing: -0.5,
          }}
        >
          {renderHeadline(slide.headline, slide.accentPhrase)}
        </h1>
        {slide.subtext ? (
          <p
            style={{
              margin: 0,
              marginTop: 32,
              color: theme.muted,
              fontSize: 32,
              lineHeight: 1.3,
            }}
          >
            {slide.subtext}
          </p>
        ) : null}
      </div>

      {/* bottom-left: swipe cue */}
      <div
        style={{
          fontFamily: theme.fontHead,
          fontWeight: 500,
          fontSize: 30,
          color: theme.accent,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        swipe <span style={{ fontSize: 34 }}>→</span>
      </div>
    </div>
  );
}
