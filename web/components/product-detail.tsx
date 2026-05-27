"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/features/products/api"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"

export function ProductDetail() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: products, isPending, isError } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => getProducts(),
  })

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="aspect-square max-w-lg rounded-2xl" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full max-w-xl" />
      </div>
    )
  }

  if (isError || !products) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Could not load this product.</p>
        <Button variant="outline" asChild>
          <Link href="/products">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-medium">Product not found</h1>
        <p className="text-sm text-muted-foreground">
          It may have been removed or the link is invalid.
        </p>
        <Button variant="outline" asChild>
          <Link href="/products">Back to shop</Link>
        </Button>
      </div>
    )
  }

  const outOfStock = product.stock < 1

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted ring-1 ring-foreground/10">
        <span className="text-sm text-muted-foreground">{product.category.name}</span>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{product.category.name}</p>
          <h1 className="text-3xl font-medium tracking-tight">{product.name}</h1>
          <p className="text-2xl font-medium">{formatPrice(product.price)}</p>
          <p className="text-sm text-muted-foreground">
            SKU {product.sku} · {outOfStock ? "Out of stock" : `${product.stock} available`}
          </p>
        </div>

        {product.description && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button disabled={outOfStock} title={outOfStock ? "Out of stock" : undefined}>
            Add to cart
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>

        {!outOfStock && (
          <p className="text-xs text-muted-foreground">
            Cart wiring comes in the next step — button is ready.
          </p>
        )}
      </div>
    </div>
  )
}
