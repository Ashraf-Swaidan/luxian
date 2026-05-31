import { HomeHero } from "@/components/layout/home-hero"
import { BrandMosaicSection } from "@/components/layout/brand-mosaic-section"
import { CollectionPairSection } from "@/components/layout/collection-pair-section"
import { SummerSeasonBanner } from "@/components/layout/summer-season-banner"
import { NowTrending } from "@/components/products/now-trending"
import { ProductsGrid } from "@/components/products/products-grid"

export default function Page() {
  return (
    <main>
      <HomeHero />
      <ProductsGrid limit={3} />
      <SummerSeasonBanner />
      <NowTrending />
      <BrandMosaicSection />
      <CollectionPairSection />
    </main>
  )
}
