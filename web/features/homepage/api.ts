import { api } from "@/lib/api-client"
import type { HomepageSettings } from "@/lib/types/homepage"

export type UpdateHomepageSettingsInput = {
  latestCollectionId?: string | null
  trendingCollectionId?: string | null
  bannerCollectionId?: string | null
  pairLeftCollectionId?: string | null
  pairRightCollectionId?: string | null
  heroCollectionId?: string | null
  heroImageUrl?: string | null
  heroWordmark?: string | null
  heroEyebrow?: string | null
  heroHeading?: string | null
  heroTagline?: string | null
  bannerImageUrl?: string | null
  bannerButtonText?: string
  brandImage1Url?: string | null
  brandImage2Url?: string | null
  brandImage3Url?: string | null
  brandImage4Url?: string | null
  brandImage5Url?: string | null
  brandImage6Url?: string | null
}

export function getHomepageSettings() {
  return api.get<HomepageSettings>("homepage", { auth: false })
}

export function updateHomepageSettings(body: UpdateHomepageSettingsInput) {
  return api.patch<HomepageSettings>("homepage", body)
}
