"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { StoreImage } from "@/components/common/store-image"
import { Skeleton } from "@/components/ui/skeleton"
import { getHomepageSettings } from "@/features/homepage/api"
import { getProducts } from "@/features/products/api"
import { getErrorMessage, toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/lib/types/product"

const TRENDING_LIMIT = 12

export function NowTrending() {
  const params = { page: 1, limit: TRENDING_LIMIT }

  const { data: homepage, isPending: isHomepagePending } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })
  const trendingProducts =
    homepage?.trendingCollection?.collectionProducts?.map((item) => item.product).slice(0, TRENDING_LIMIT) ?? []
  const shouldLoadFallbackProducts = !isHomepagePending && trendingProducts.length === 0
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
    enabled: shouldLoadFallbackProducts,
  })

  useEffect(() => {
    if (isError) {
      toastApiError(error, "Failed to load trending products")
    }
  }, [isError, error])

  const products = trendingProducts.length ? trendingProducts : (data?.data ?? [])

  return (
    <section className="bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
      <div className="mx-auto w-full max-w-[112rem]">
        <h2 className="mb-12 text-3xl font-medium tracking-tight text-neutral-950">Now trending</h2>

        {(isHomepagePending || (shouldLoadFallbackProducts && isPending)) && <TrendingSkeleton />}

        {isError && (
          <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load trending products")}</p>
        )}

        {!isHomepagePending && !(shouldLoadFallbackProducts && isPending) && !isError && products.length > 0 && (
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, TRENDING_LIMIT).map((product) => (
              <TrendingItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TrendingItem({ product }: { product: Product }) {
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
        <p className="truncate text-base font-medium text-neutral-950">{product.category?.name ?? "Luxian"}</p>
        <p className="mt-1 line-clamp-2 text-base leading-snug text-neutral-500">{product.name}</p>
      </div>
    </Link>
  )
}

function TrendingSkeleton() {
  return (
    <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: TRENDING_LIMIT }).map((_, i) => (
        <div key={i} className="grid min-h-24 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5">
          <Skeleton className="h-24 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
