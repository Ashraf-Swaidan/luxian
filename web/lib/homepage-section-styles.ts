import type { CSSProperties } from "react"

import { HOMEPAGE_COLOR_DEFAULTS } from "@/lib/homepage-color-defaults"
import type { HomepageSettings } from "@/lib/types/homepage"

/** Bottom haze / wash overlays for the hero, derived from the chosen background. */
export function heroAtmosphereStyles(backgroundColor: string) {
  const base = backgroundColor.trim()

  return {
    sectionWash: {
      backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${base} 72%, white), ${base})`,
    } satisfies CSSProperties,
    bottomHaze: {
      backgroundImage: `linear-gradient(180deg, transparent, color-mix(in srgb, ${base} 72%, transparent))`,
    } satisfies CSSProperties,
    mobileBottomFade: {
      backgroundImage: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${base} 55%, transparent) 55%, color-mix(in srgb, ${base} 92%, transparent) 100%)`,
    } satisfies CSSProperties,
    desktopBottomFade: {
      backgroundImage: `linear-gradient(180deg, transparent, color-mix(in srgb, ${base} 72%, transparent))`,
    } satisfies CSSProperties,
  }
}

export function pairGradientStyle(
  homepage?: Pick<HomepageSettings, "pairGradientStartColor" | "pairGradientEndColor"> | null,
): CSSProperties | undefined {
  const start = homepage?.pairGradientStartColor
  const end = homepage?.pairGradientEndColor
  if (!start && !end) {
    return undefined
  }

  const from = start ?? HOMEPAGE_COLOR_DEFAULTS.pairGradientStart
  const to = end ?? HOMEPAGE_COLOR_DEFAULTS.pairGradientEnd

  return {
    backgroundImage: `linear-gradient(90deg, transparent, color-mix(in srgb, ${from} 35%, transparent), color-mix(in srgb, ${to} 28%, transparent), transparent)`,
  }
}
