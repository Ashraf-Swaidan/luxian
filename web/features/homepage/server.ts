import "server-only"

import { unstable_cache } from "next/cache"

import type { PaginatedProducts } from "@/features/products/types"
import { HOMEPAGE_CACHE_TAG, HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepage-cache"
import { serverApiGet } from "@/lib/server-api"
import type { Collection } from "@/lib/types/collection"
import type { HomepageSettings } from "@/lib/types/homepage"
import type { Product } from "@/lib/types/product"

const HERO_PRODUCT_LIMIT = 3
const LATEST_PRODUCT_LIMIT = 3
const TRENDING_PRODUCT_LIMIT = 12

export type HomepageBundle = {
  homepage: HomepageSettings
  heroProducts: Product[]
  latestCollection: Collection | null
  latestProducts: Product[]
  trendingProducts: Product[]
  pairCollections: Collection[]
}

function collectionProducts(collection: Collection | null | undefined, limit: number) {
  return collection?.collectionProducts?.map((item) => item.product).slice(0, limit) ?? []
}

async function loadHomepageBundleUncached(): Promise<HomepageBundle> {
  const [homepage, fallbackLatest, fallbackTrending] = await Promise.all([
    serverApiGet<HomepageSettings>("homepage"),
    serverApiGet<PaginatedProducts>(`products?page=1&limit=${LATEST_PRODUCT_LIMIT}`),
    serverApiGet<PaginatedProducts>(`products?page=1&limit=${TRENDING_PRODUCT_LIMIT}`),
  ])

  const latestProducts = collectionProducts(homepage.latestCollection, LATEST_PRODUCT_LIMIT)
  const trendingProducts = collectionProducts(homepage.trendingCollection, TRENDING_PRODUCT_LIMIT)
  const pairCollections = [homepage.pairLeftCollection, homepage.pairRightCollection].filter(Boolean) as Collection[]

  return {
    homepage,
    heroProducts: fallbackLatest.data.slice(0, HERO_PRODUCT_LIMIT),
    latestCollection: homepage.latestCollection,
    latestProducts: latestProducts.length ? latestProducts : fallbackLatest.data,
    trendingProducts: trendingProducts.length ? trendingProducts : fallbackTrending.data,
    pairCollections,
  }
}

export const getCachedHomepageBundle = unstable_cache(loadHomepageBundleUncached, ["homepage-public"], {
  revalidate: HOMEPAGE_REVALIDATE_SECONDS,
  tags: [HOMEPAGE_CACHE_TAG],
})
