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
  heroCollectionId: string | null
  heroCollection: Collection | null
  heroImageUrl: string | null
  heroWordmark: string | null
  heroEyebrow: string | null
  heroHeading: string | null
  heroTagline: string | null
  bannerImageUrl: string | null
  bannerButtonText: string
  brandImage1Url: string | null
  brandImage2Url: string | null
  brandImage3Url: string | null
  brandImage4Url: string | null
  brandImage5Url: string | null
  brandImage6Url: string | null
  heroBackgroundColor: string | null
  heroTextColor: string | null
  heroCtaBackgroundColor: string | null
  heroCtaTextColor: string | null
  bannerCtaBackgroundColor: string | null
  bannerCtaTextColor: string | null
  mosaicBackgroundColor: string | null
  mosaicTextColor: string | null
  mosaicCtaBackgroundColor: string | null
  mosaicCtaTextColor: string | null
  pairGradientStartColor: string | null
  pairGradientEndColor: string | null
  createdAt: string
  updatedAt: string
}
