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
    <section className="border-b border-neutral-200/80 bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
      <div className="mx-auto w-full max-w-[112rem]">
        <div className="mb-10 space-y-2">
          <h2 className="text-3xl font-medium tracking-tight text-neutral-950">Recommended for you</h2>
          <p className="text-sm text-muted-foreground">Based on your recent browsing on this device.</p>
        </div>

        <div className="-mx-6 flex snap-x gap-6 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-x-12 lg:gap-y-14 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-4">
          {products.slice(0, RECOMMENDATION_LIMIT).map((product) => (
            <RecommendedItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RecommendedItem({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="grid min-h-24 w-[82vw] shrink-0 snap-start grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 sm:w-[24rem] lg:w-auto"
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
