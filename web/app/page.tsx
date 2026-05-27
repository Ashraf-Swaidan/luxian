import { HomeHero } from "@/components/home-hero"
import { ProductsGrid } from "@/components/products-grid"
import { StoreShell } from "@/components/store-shell"

export default function Page() {
  return (
    <main className="py-8 sm:py-12">
      <StoreShell className="flex flex-col gap-14">
        <HomeHero />
        <ProductsGrid title="Featured" limit={4} />
      </StoreShell>
    </main>
  )
}
