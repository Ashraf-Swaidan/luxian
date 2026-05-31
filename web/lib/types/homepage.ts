import type { Collection } from "@/lib/types/collection"

export type HomepageSettings = {
  id: string
  latestCollectionId: string | null
  latestCollection: Collection | null
  trendingCollectionId: string | null
  trendingCollection: Collection | null
  bannerCollectionId: string | null
  bannerCollection: Collection | null
  bannerImageUrl: string | null
  bannerButtonText: string
  createdAt: string
  updatedAt: string
}
