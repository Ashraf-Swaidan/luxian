import { api } from "@/lib/api-client"
import type { HomepageSettings } from "@/lib/types/homepage"

export type UpdateHomepageSettingsInput = {
  latestCollectionId?: string | null
  trendingCollectionId?: string | null
  bannerCollectionId?: string | null
  bannerImageUrl?: string | null
  bannerButtonText?: string
}

export function getHomepageSettings() {
  return api.get<HomepageSettings>("homepage", { auth: false })
}

export function updateHomepageSettings(body: UpdateHomepageSettingsInput) {
  return api.patch<HomepageSettings>("homepage", body)
}
