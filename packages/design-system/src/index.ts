// @the-static/design-system
//
// Shared visual design tokens for The Static, derived from the supplied
// Design System document. Monochrome palette, slash motif, flat surfaces.
//
// These tokens are consumed by both the mobile app (React Native) and the
// admin dashboard (Next.js). Platform-specific component implementations
// reference these values rather than hard-coding colours.

export const brand = {
  name: "THE STATIC",
  tagline: "THERE'S MORE OF US THAN YOU THINK",
  supportingLine: "Different interests. Different frequencies. Same signal.",
  invitation: "Find your frequency.",
  firstEdition: "ISSUE/001",
  place: "Chattogram, Bangladesh",
} as const;

export const slashMotif = {
  label: (a: string, b: string) => `${a} / ${b}`,
  edition: (n: string) => `ISSUE/${n}`,
  cardNumber: (n: string) => `/${n}`,
} as const;

// Monochrome palette (no gradients). Depth from flat fills, borders,
// solid offset shadows, grayscale imagery and noise.
export const color = {
  bg: "#070707",        // page and card ground
  ink: "#ececec",       // main text, buttons, active states
  mid: "#8b8b8b",       // labels, metadata, secondary text
  line: "#2b2b2b",      // hairlines, borders, grid gaps
  bodyCopy: "#c9c9c9",  // paragraphs on dark
  softCopy: "#bdbdbd",  // card descriptions
  inputBorder: "#3a3a3a", // form fields, unlit bars
  pureBlack: "#000",    // input fill, button text on light
  white: "#fff",        // error states, hover inversions, CTA ring
  solidShadow: "#4a4a4a", // CTA offset shadow
} as const;

export const overlay = {
  videoShade: "rgba(0,0,0,0.6)",
  panel: "rgba(7,7,7,0.86)",
  cardGrid: "rgba(7,7,7,0.85)",
  rowBackground: "rgba(7,7,7,0.55)",
  dockPlayer: "rgba(7,7,7,0.92)",
  idCardImageOverlay: "rgba(7,7,7,0.55)",
} as const;

export const radius = {
  pill: 99,
  panel: 10,
  dock: 22,
  playerCard: 16,
  smallLogoBox: 12,
  idCard: 28,
} as const;

export const borderWidth = 1;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  page: 20,
  section: 40,
} as const;

export const font = {
  display: "Space Grotesk",
  body: "Inter",
  utility: "IBM Plex Mono",
} as const;

export const fontSize = {
  label: 12,
  body: 14,
  bodyLarge: 16,
  heading: 20,
  headingLarge: 28,
  display: 40,
} as const;

export const lineHeight = {
  tight: 0.84,
  normal: 1.1,
  body: 1.6,
} as const;

export const tracking = {
  tight: -0.045,
  label: 0.14,
} as const;

export const motion = {
  fast: 150,
  normal: 220,
  morph: 440,
  reveal: 700,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  overshoot: "cubic-bezier(0.24, 1.34, 0.38, 1)",
} as const;
