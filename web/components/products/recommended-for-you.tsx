"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { StoreImage } from "@/components/common/store-image"
import { getPersonalizedRecommendations } from "@/features/personalization/api"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/lib/types/product"

const RECOMMENDATION_LIMIT = 12

export function RecommendedForYou() {
  const { data: products = [], isPending } = useQuery({
    queryKey: queryKeys.personalization.recommendations(RECOMMENDATION_LIMIT),
    queryFn: () => getPersonalizedRecommendations(RECOMMENDATION_LIMIT),
    staleTime: 60 * 1000,
    retry: false,
  })

  if (isPending || products.length === 0) {
    return null
  }

  return (
    <section className="mb-10 pb-10 sm:mb-12 sm:pb-12">
      <div className="mb-6 space-y-2">
        <h2 className="text-3xl font-medium tracking-tight text-neutral-950">Recommended for you</h2>
        <p className="text-sm text-muted-foreground">Based on your recent browsing on this device.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.slice(0, RECOMMENDATION_LIMIT).map((product) => (
          <RecommendedItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function RecommendedItem({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="grid min-h-24 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5"
    >
      <div className="relative h-24 w-full overflow-hidden bg-white">
        {product.imageUrl ? (
          <StoreImage src={product.imageUrl} alt={product.name} fill className="object-contain" sizes="112px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Luxian
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-base leading-snug font-medium text-neutral-950">{product.name}</p>
        <p className="mt-1 truncate text-sm text-neutral-500">{product.category?.name ?? "Luxian"}</p>
      </div>
    </Link>
  )
}
