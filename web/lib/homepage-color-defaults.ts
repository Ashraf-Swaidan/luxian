/** Shown in CMS pickers when a color field is unset (matches current storefront defaults). */
export const HOMEPAGE_COLOR_DEFAULTS = {
  heroBackground: "#e5e0d6",
  heroText: "#0a0a0a",
  heroCtaBackground: "#ffffff",
  heroCtaText: "#0a0a0a",
  bannerCtaBackground: "#ffffff",
  bannerCtaText: "#0a0a0a",
  mosaicBackground: "#0a0a0a",
  mosaicText: "#ffffff",
  mosaicCtaBackground: "#ffffff",
  mosaicCtaText: "#0a0a0a",
  pairGradientStart: "#b8e8e0",
  pairGradientEnd: "#f2e8c8",
} as const

export type HomepageColorFieldKey = keyof typeof HOMEPAGE_COLOR_DEFAULTS
