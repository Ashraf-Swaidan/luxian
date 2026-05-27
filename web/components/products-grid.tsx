"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import { EmptyState } from "@/components/empty-state"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/features/products/api"
import { getErrorMessage, toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"

type ProductsGridProps = {
  categoryId?: string
  limit?: number
  title?: string
}

export function ProductsGrid({ categoryId, limit, title }: ProductsGridProps) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.products.list(categoryId),
    queryFn: () => getProducts(categoryId),
  })

  useEffect(() => {
    if (isError) {
      toastApiError(error, "Failed to load products")
    }
  }, [isError, error])

  if (isPending) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: limit ?? 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load products")}
        </p>
      </section>
    )
  }

  const products = limit ? data?.slice(0, limit) : data

  if (!products?.length) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <EmptyState
          title="No products yet"
          description="Check back soon, or sign in as admin to add catalog items."
          actionLabel="Browse shop"
          actionHref="/products"
        />
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {title && <h2 className="text-lg font-medium">{title}</h2>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
