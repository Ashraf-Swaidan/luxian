import type { UpdateHomepageSettingsInput } from "@/features/homepage/api"
import type { Collection } from "@/lib/types/collection"
import type { HomepageSettings } from "@/lib/types/homepage"
import type { Product } from "@/lib/types/product"

export type HomepageDraft = Pick<
  HomepageSettings,
  | "latestCollectionId"
  | "trendingCollectionId"
  | "bannerCollectionId"
  | "pairLeftCollectionId"
  | "pairRightCollectionId"
  | "heroCollectionId"
  | "heroImageUrl"
  | "bannerImageUrl"
  | "brandImage1Url"
  | "brandImage2Url"
  | "brandImage3Url"
  | "brandImage4Url"
  | "brandImage5Url"
  | "brandImage6Url"
> & {
  heroWordmark: string
  heroEyebrow: string
  heroHeading: string
  heroTagline: string
  bannerButtonText: string
}

export type HomepageSectionId = "hero" | "latest" | "banner" | "trending" | "mosaic" | "pair"

export type HomepageDraftPreviewBundle = {
  homepage: HomepageSettings
  heroProducts: Product[]
  latestCollection: Collection | null
  latestProducts: Product[]
  trendingProducts: Product[]
  pairCollections: Collection[]
}

const HERO_PRODUCT_LIMIT = 3
const LATEST_PRODUCT_LIMIT = 3
const TRENDING_PRODUCT_LIMIT = 12

const DRAFT_COMPARE_KEYS: (keyof HomepageDraft)[] = [
  "latestCollectionId",
  "trendingCollectionId",
  "bannerCollectionId",
  "pairLeftCollectionId",
  "pairRightCollectionId",
  "heroCollectionId",
  "heroImageUrl",
  "heroWordmark",
  "heroEyebrow",
  "heroHeading",
  "heroTagline",
  "bannerImageUrl",
  "bannerButtonText",
  "brandImage1Url",
  "brandImage2Url",
  "brandImage3Url",
  "brandImage4Url",
  "brandImage5Url",
  "brandImage6Url",
]

export function createDraftFromSettings(settings: HomepageSettings): HomepageDraft {
  return {
    latestCollectionId: settings.latestCollectionId,
    trendingCollectionId: settings.trendingCollectionId,
    bannerCollectionId: settings.bannerCollectionId,
    pairLeftCollectionId: settings.pairLeftCollectionId,
    pairRightCollectionId: settings.pairRightCollectionId,
    heroCollectionId: settings.heroCollectionId,
    heroImageUrl: settings.heroImageUrl,
    heroWordmark: settings.heroWordmark ?? "",
    heroEyebrow: settings.heroEyebrow ?? "",
    heroHeading: settings.heroHeading ?? "",
    heroTagline: settings.heroTagline ?? "",
    bannerImageUrl: settings.bannerImageUrl,
    bannerButtonText: settings.bannerButtonText || "See Collection",
    brandImage1Url: settings.brandImage1Url,
    brandImage2Url: settings.brandImage2Url,
    brandImage3Url: settings.brandImage3Url,
    brandImage4Url: settings.brandImage4Url,
    brandImage5Url: settings.brandImage5Url,
    brandImage6Url: settings.brandImage6Url,
  }
}

function normalizeDraftValue(key: keyof HomepageDraft, value: HomepageDraft[keyof HomepageDraft]) {
  if (key === "bannerButtonText") {
    return (value as string) || "See Collection"
  }
  if (
    key === "heroWordmark" ||
    key === "heroEyebrow" ||
    key === "heroHeading" ||
    key === "heroTagline"
  ) {
    return (value as string | null) ?? ""
  }
  return value ?? null
}

function normalizeSavedValue(key: keyof HomepageDraft, settings: HomepageSettings) {
  const saved = createDraftFromSettings(settings)[key]
  return normalizeDraftValue(key, saved)
}

export function isDraftDirty(draft: HomepageDraft, settings: HomepageSettings) {
  return DRAFT_COMPARE_KEYS.some((key) => normalizeDraftValue(key, draft[key]) !== normalizeSavedValue(key, settings))
}

export function buildHomepagePayload(draft: HomepageDraft): UpdateHomepageSettingsInput {
  return {
    latestCollectionId: draft.latestCollectionId,
    trendingCollectionId: draft.trendingCollectionId,
    bannerCollectionId: draft.bannerCollectionId,
    pairLeftCollectionId: draft.pairLeftCollectionId,
    pairRightCollectionId: draft.pairRightCollectionId,
    heroCollectionId: draft.heroCollectionId,
    heroImageUrl: draft.heroImageUrl,
    heroWordmark: draft.heroWordmark.trim() || null,
    heroEyebrow: draft.heroEyebrow.trim() || null,
    heroHeading: draft.heroHeading.trim() || null,
    heroTagline: draft.heroTagline.trim() || null,
    bannerImageUrl: draft.bannerImageUrl,
    bannerButtonText: draft.bannerButtonText,
    brandImage1Url: draft.brandImage1Url,
    brandImage2Url: draft.brandImage2Url,
    brandImage3Url: draft.brandImage3Url,
    brandImage4Url: draft.brandImage4Url,
    brandImage5Url: draft.brandImage5Url,
    brandImage6Url: draft.brandImage6Url,
  }
}

export function resolveCollection(
  collections: Collection[],
  id: string | null | undefined,
): Collection | null {
  if (!id) {
    return null
  }
  return collections.find((collection) => collection.id === id) ?? null
}

export function collectionProducts(collection: Collection | null | undefined, limit: number) {
  return collection?.collectionProducts?.map((item) => item.product).slice(0, limit) ?? []
}

function mergeDraftIntoSettings(
  draft: HomepageDraft,
  baseline: HomepageSettings,
  collections: Collection[],
): HomepageSettings {
  return {
    ...baseline,
    latestCollectionId: draft.latestCollectionId,
    latestCollection: resolveCollection(collections, draft.latestCollectionId),
    trendingCollectionId: draft.trendingCollectionId,
    trendingCollection: resolveCollection(collections, draft.trendingCollectionId),
    bannerCollectionId: draft.bannerCollectionId,
    bannerCollection: resolveCollection(collections, draft.bannerCollectionId),
    pairLeftCollectionId: draft.pairLeftCollectionId,
    pairLeftCollection: resolveCollection(collections, draft.pairLeftCollectionId),
    pairRightCollectionId: draft.pairRightCollectionId,
    pairRightCollection: resolveCollection(collections, draft.pairRightCollectionId),
    heroCollectionId: draft.heroCollectionId,
    heroCollection: resolveCollection(collections, draft.heroCollectionId),
    heroImageUrl: draft.heroImageUrl,
    heroWordmark: draft.heroWordmark.trim() || null,
    heroEyebrow: draft.heroEyebrow.trim() || null,
    heroHeading: draft.heroHeading.trim() || null,
    heroTagline: draft.heroTagline.trim() || null,
    bannerImageUrl: draft.bannerImageUrl,
    bannerButtonText: draft.bannerButtonText,
    brandImage1Url: draft.brandImage1Url,
    brandImage2Url: draft.brandImage2Url,
    brandImage3Url: draft.brandImage3Url,
    brandImage4Url: draft.brandImage4Url,
    brandImage5Url: draft.brandImage5Url,
    brandImage6Url: draft.brandImage6Url,
  }
}

export function buildDraftPreviewBundle(
  draft: HomepageDraft,
  baseline: HomepageSettings,
  collections: Collection[],
  fallbackProducts: Product[],
): HomepageDraftPreviewBundle {
  const homepage = mergeDraftIntoSettings(draft, baseline, collections)
  const heroProducts = collectionProducts(homepage.heroCollection, HERO_PRODUCT_LIMIT)
  const latestProducts = collectionProducts(homepage.latestCollection, LATEST_PRODUCT_LIMIT)
  const trendingProducts = collectionProducts(homepage.trendingCollection, TRENDING_PRODUCT_LIMIT)
  const pairCollections = [homepage.pairLeftCollection, homepage.pairRightCollection].filter(
    Boolean,
  ) as Collection[]

  return {
    homepage,
    heroProducts: heroProducts.length ? heroProducts : fallbackProducts.slice(0, HERO_PRODUCT_LIMIT),
    latestCollection: homepage.latestCollection,
    latestProducts: latestProducts.length ? latestProducts : fallbackProducts.slice(0, LATEST_PRODUCT_LIMIT),
    trendingProducts: trendingProducts.length
      ? trendingProducts
      : fallbackProducts.slice(0, TRENDING_PRODUCT_LIMIT),
    pairCollections,
  }
}
