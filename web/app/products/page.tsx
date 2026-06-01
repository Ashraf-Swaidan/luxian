import { Suspense } from "react"

import { ProductsCatalog } from "@/components/products/products-catalog"
import { RecommendedForYou } from "@/components/products/recommended-for-you"
import { StorePage } from "@/components/layout/store-page"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsPage() {
  return (
    <StorePage
      beforeHeader={<RecommendedForYou />}
      title="Shop"
      description="Browse the collection. Sign in to save items to your bag."
    >
      <Suspense fallback={<CatalogFallback />}>
        <ProductsCatalog />
      </Suspense>
    </StorePage>
  )
}

function CatalogFallback() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-md" />
      ))}
    </div>
  )
}
