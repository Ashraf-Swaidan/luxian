import { HomeHero } from "@/components/home-hero"
import { ProductsGrid } from "@/components/products-grid"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col gap-14 px-6 py-10">
      <HomeHero />

      <section className="space-y-1 border-t border-border/60 pt-10">
        <ProductsGrid title="Featured" limit={3} />
      </section>
    </main>
  )
}
