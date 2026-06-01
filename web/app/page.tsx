import { HomeHero } from "@/components/layout/home-hero"
import { BrandMosaicSection } from "@/components/layout/brand-mosaic-section"
import { CollectionPairSection } from "@/components/layout/collection-pair-section"
import { SummerSeasonBanner } from "@/components/layout/summer-season-banner"
import { NowTrending } from "@/components/products/now-trending"
import { ProductsGrid } from "@/components/products/products-grid"
import { getCachedHomepageBundle } from "@/features/homepage/server"

export default async function Page() {
  let bundle: Awaited<ReturnType<typeof getCachedHomepageBundle>> | null = null

  try {
    bundle = await getCachedHomepageBundle()
  } catch (error) {
    console.error(error)
  }

  if (!bundle) {
    return (
      <main>
        <HomeHero products={[]} />
        <HomepageUnavailable />
      </main>
    )
  }

  return (
    <main>
      <HomeHero products={bundle.heroProducts} />
      <ProductsGrid latestCollection={bundle.latestCollection} products={bundle.latestProducts} />
      <SummerSeasonBanner homepage={bundle.homepage} />
      <NowTrending products={bundle.trendingProducts} />
      <BrandMosaicSection homepage={bundle.homepage} />
      <CollectionPairSection collections={bundle.pairCollections} />
    </main>
  )
}

function HomepageUnavailable() {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
      <div className="mx-auto max-w-[92rem] border border-border/70 bg-muted/20 px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Please try again</p>
        <h1 className="mt-3 font-display text-5xl leading-none font-bold text-neutral-950 uppercase sm:text-6xl">
          Store details unavailable
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          We are having trouble loading the latest store details right now. Please refresh in a moment.
        </p>
      </div>
    </section>
  )
}
