import type { ValueSlide as ValueSlideData } from "../../types";
import { valueHasChart } from "../../types";
import { theme } from "../../theme";

interface Props {
  slide: ValueSlideData;
  index: number;
  total: number;
}

export default function ValueSlide({ slide, index, total }: Props) {
  const withChart = valueHasChart(slide);
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
      {/* top row: kicker + counter */}
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
        <span style={{ color: theme.accent }}>{slide.kicker || ""}</span>
        <span style={{ color: theme.muted }}>
          {index + 1} / {total}
        </span>
      </div>

      {withChart ? (
        <>
          {/* headline */}
          <h2
            style={{
              margin: 0,
              marginTop: 28,
              fontFamily: theme.fontHead,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.12,
              letterSpacing: -0.5,
            }}
          >
            {slide.headline}
          </h2>

          {/* chart frame (image slot) */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              marginTop: 36,
              marginBottom: slide.body ? 36 : 0,
              borderRadius: 18,
              overflow: "hidden",
              background: theme.surface,
              border: slide.imageDataUrl
                ? `1px solid ${theme.surface}`
                : `1px dashed ${theme.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {slide.imageDataUrl ? (
              <img
                src={slide.imageDataUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: slide.imageFit ?? "contain",
                }}
              />
            ) : (
              <span
                style={{
                  color: theme.muted,
                  fontSize: 30,
                  fontFamily: theme.fontBody,
                }}
              >
                drop your chart here
              </span>
            )}
          </div>

          {/* body */}
          {slide.body ? (
            <p
              style={{
                margin: 0,
                color: theme.muted,
                fontSize: 33,
                lineHeight: 1.38,
                whiteSpace: "pre-line",
              }}
            >
              {slide.body}
            </p>
          ) : null}
        </>
      ) : (
        /* text-only: center headline + body in the available space */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: theme.fontHead,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1.12,
              letterSpacing: -0.5,
            }}
          >
            {slide.headline}
          </h2>
          {slide.body ? (
            <p
              style={{
                margin: 0,
                marginTop: 32,
                color: theme.muted,
                fontSize: 36,
                lineHeight: 1.4,
                whiteSpace: "pre-line",
              }}
            >
              {slide.body}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
