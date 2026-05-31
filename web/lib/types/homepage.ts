import type { Collection } from "@/lib/types/collection"

export type HomepageSettings = {
  id: string
  latestCollectionId: string | null
  latestCollection: Collection | null
  trendingCollectionId: string | null
  trendingCollection: Collection | null
  bannerCollectionId: string | null
  bannerCollection: Collection | null
  pairLeftCollectionId: string | null
  pairLeftCollection: Collection | null
  pairRightCollectionId: string | null
  pairRightCollection: Collection | null
  bannerImageUrl: string | null
  bannerButtonText: string
  brandImage1Url: string | null
  brandImage2Url: string | null
  brandImage3Url: string | null
  brandImage4Url: string | null
  brandImage5Url: string | null
  brandImage6Url: string | null
  createdAt: string
  updatedAt: string
}
