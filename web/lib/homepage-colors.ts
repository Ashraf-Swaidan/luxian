import type { HomepageSettings } from "@/lib/types/homepage"

export const HOMEPAGE_COLOR_DRAFT_KEYS = [
  "heroBackgroundColor",
  "heroTextColor",
  "heroCtaBackgroundColor",
  "heroCtaTextColor",
  "bannerCtaBackgroundColor",
  "bannerCtaTextColor",
  "mosaicBackgroundColor",
  "mosaicTextColor",
  "mosaicCtaBackgroundColor",
  "mosaicCtaTextColor",
  "pairGradientStartColor",
  "pairGradientEndColor",
] as const

export type HomepageColorDraftKey = (typeof HOMEPAGE_COLOR_DRAFT_KEYS)[number]

export type HomepageColorDraftFields = Record<HomepageColorDraftKey, string>

export function colorDraftValue(value: string | null | undefined) {
  return value ?? ""
}

export function colorPayloadValue(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function colorFieldsFromSettings(
  settings: HomepageSettings,
): HomepageColorDraftFields {
  return Object.fromEntries(
    HOMEPAGE_COLOR_DRAFT_KEYS.map((key) => [key, colorDraftValue(settings[key])]),
  ) as HomepageColorDraftFields
}

export function colorFieldsFromDraft(
  draft: HomepageColorDraftFields,
): Pick<HomepageSettings, HomepageColorDraftKey> {
  return Object.fromEntries(
    HOMEPAGE_COLOR_DRAFT_KEYS.map((key) => [key, colorPayloadValue(draft[key])]),
  ) as Pick<HomepageSettings, HomepageColorDraftKey>
}

export function colorFieldsPayload(
  draft: HomepageColorDraftFields,
): Partial<Record<HomepageColorDraftKey, string | null>> {
  return Object.fromEntries(
    HOMEPAGE_COLOR_DRAFT_KEYS.map((key) => [key, colorPayloadValue(draft[key])]),
  )
}
