"use client"

import { ArrowLeftIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"

import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductRecommendationSection } from "@/components/products/product-recommendation-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trackVisitorEvent } from "@/features/personalization/api"
import { getProductContext } from "@/features/products/api"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"

export function ProductDetail() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const {
    data: context,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.context(id),
    queryFn: () => getProductContext(id),
    enabled: Boolean(id),
  })
  const product = context?.product

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

  if (isError || !product || !context) {
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
  const incomingSoon = outOfStock && Boolean(product.incomingStock && product.incomingStock > 0)

  return (
    <div className="space-y-16">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div className="space-y-8 lg:pt-2">
          <div className="space-y-4">
            {product.category && (
              <p className="text-xs font-medium tracking-wider text-[var(--luxian-teal)] uppercase">
                {product.category.name}
              </p>
            )}
            <h1 className="font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="text-2xl font-medium tabular-nums">{formatPrice(product.price)}</p>
          </div>

          {product.description && (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="space-y-3">
            <AddToCartButton productId={product.id} disabled={outOfStock} />
            <p className="text-xs text-muted-foreground">
              {outOfStock ? (incomingSoon ? "More stock coming soon" : "Out of stock") : `${product.stock} in stock`}
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

      <div className="space-y-14 border-t border-border/60 pt-12">
        <ProductRecommendationSection
          title="More from this collection"
          description={context.collection ? `Pieces selected from ${context.collection.name}.` : undefined}
          products={context.collectionProducts}
          minItems={3}
        />
        <ProductRecommendationSection
          title="Similar products"
          description="Pieces with related category, collection, and price signals."
          products={context.similarProducts}
          minItems={4}
        />
      </div>
    </div>
  )
}
