"use client"

import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProduct } from "@/features/products/api"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"

export function ProductDetail() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: product, isPending, isError } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  })

  if (isPending) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Could not load this product.</p>
        <Button variant="outline" asChild>
          <Link href="/products">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const outOfStock = product.stock < 1

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-muted">
        {product.imageUrl ? (
          <StoreImage
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {product.category?.name ?? "Product"}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--luxian-teal)]">
              {product.category.name}
            </p>
          )}
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="text-2xl font-medium tabular-nums">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted-foreground">
            {outOfStock ? "Out of stock" : `${product.stock} available`}
            {product.sku ? ` · ${product.sku}` : ""}
          </p>
        </div>

        {product.description && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AddToCartButton productId={product.id} disabled={outOfStock} />
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/products">← Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
