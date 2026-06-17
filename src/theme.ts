export const theme = {
  bg: "#0B0E11", // slide background (near-black, matches trading charts)
  surface: "#161B22", // chart frame / card surfaces
  accent: "#16C784", // "profit green" — key phrase, swipe arrow, CTA pill
  accentText: "#04342C", // dark green text used ON the accent pill
  text: "#FFFFFF", // headlines
  muted: "#8B949E", // body / secondary text
  loss: "#FF5C5C", // use sparingly (mistake/loss framing)
  level: "#E3B341", // optional yellow "level line" accent
  handle: "@hayeder.trades",
  fontHead: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
};

export type Theme = typeof theme;
