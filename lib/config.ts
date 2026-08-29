/**
 * App configuration. Values come from env vars where available and fall back
 * to clearly-marked placeholders — no fake support details are invented, and
 * anything undefined is simply not rendered.
 */

export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Singapore";

/** Required attribution for the pixel art. Rendered in the UI. */
export const ATTRIBUTION = {
  label: "LimeZu — Modern Interiors",
  href: "https://limezu.itch.io/moderninteriors",
};
