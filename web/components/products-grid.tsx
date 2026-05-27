"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/features/products/api"
import { ApiError } from "@/lib/api-client"
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

  if (isPending) {
    return (
      <section className="space-y-4">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit ?? 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? error.messages.join(", ")
        : error instanceof Error
          ? error.message
          : "Failed to load products"

    toast.error(message)

    return (
      <section className="space-y-2">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <p className="text-sm text-destructive">{message}</p>
      </section>
    )
  }

  const products = limit ? data?.slice(0, limit) : data

  if (!products?.length) {
    return (
      <section className="space-y-2">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        <p className="text-sm text-muted-foreground">No products available yet.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {title && <h2 className="text-lg font-medium">{title}</h2>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
