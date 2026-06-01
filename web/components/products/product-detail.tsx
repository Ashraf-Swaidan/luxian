"use client"

import { ArrowLeftIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

import { ProductGallery } from "@/components/products/product-gallery"
import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trackVisitorEvent } from "@/features/personalization/api"
import { getProduct } from "@/features/products/api"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"

export function ProductDetail() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  })

  const viewedProductId = useRef<string | null>(null)

  useEffect(() => {
    if (!product?.id || viewedProductId.current === product.id) {
      return
    }
    viewedProductId.current = product.id
    trackVisitorEvent({ eventType: "PRODUCT_VIEW", productId: product.id })
  }, [product?.id])

  if (isPending) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-md" />
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
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductGallery product={product} />

      <div className="space-y-8 lg:pt-2">
        <div className="space-y-4">
          {product.category && (
            <p className="text-xs font-medium tracking-wider text-[var(--luxian-teal)] uppercase">
              {product.category.name}
            </p>
          )}
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="text-2xl font-medium tabular-nums">{formatPrice(product.price)}</p>
        </div>

        {product.description && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}

        <div className="space-y-3">
          <AddToCartButton productId={product.id} disabled={outOfStock} />
          <p className="text-xs text-muted-foreground">
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            {product.sku ? ` · ${product.sku}` : ""}
          </p>
        </div>

        <div className="border-t border-border/60 pt-4">
          <Button variant="ghost" asChild className="px-0 text-muted-foreground hover:text-foreground">
            <Link href="/products">
              <HugeiconsIcon icon={ArrowLeftIcon} className="size-4" strokeWidth={1.8} />
              Continue shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
