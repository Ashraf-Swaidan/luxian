import { HomeHero } from "@/components/layout/home-hero"
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
    </main>
  )
}
