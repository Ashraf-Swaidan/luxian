"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { toast } from "sonner"

import { LineItemThumb } from "@/components/common/line-item-thumb"
import { getCartLineQuantity } from "@/features/cart/cart-quantity-sync"
import { useSetCartLineQuantity } from "@/features/cart/hooks"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import type { CartItem } from "@/lib/types/cart"

type CartLineItemProps = {
  item: CartItem
}

export function CartLineItem({ item }: CartLineItemProps) {
  const queryClient = useQueryClient()
  const setLineQuantity = useSetCartLineQuantity()

  const product = item.product
  if (!product) {
    return null
  }

  const quantity = getCartLineQuantity(queryClient, item.productId, item.quantity)
  const unitPrice = Number.parseFloat(product.price)
  const lineTotal = unitPrice * quantity
  const maxQty = product.stock

  const mutateOpts = {
    onError: (error: unknown) => toastApiError(error),
  }

  const changeQty = (next: number) => {
    if (!Number.isFinite(next)) {
      return
    }

    const clamped = Math.trunc(next)
    if (clamped < 1) {
      setLineQuantity(item.productId, 1, mutateOpts)
      return
    }

    if (clamped > maxQty) {
      toast.error(`Only ${maxQty} in stock`)
      setLineQuantity(item.productId, maxQty, mutateOpts)
      return
    }

    setLineQuantity(item.productId, clamped, mutateOpts)
  }

  return (
    <div className="relative flex flex-col gap-4 border-b border-border/50 py-5 pr-9 sm:flex-row sm:items-center sm:pr-0">
      <button
        type="button"
        className="absolute top-5 right-0 flex size-9 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
        onClick={() => setLineQuantity(item.productId, 0, mutateOpts)}
        aria-label={`Remove ${product.name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-5" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 flex-1 gap-4 sm:pr-10">
        <LineItemThumb productId={item.productId} name={product.name} imageUrl={product.imageUrl} size="md" />
        <div className="min-w-0 space-y-1 self-center">
          <Link href={`/products/${item.productId}`} className="font-medium hover:text-[var(--luxian-teal)]">
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.price)}
            {product.category?.name ? ` · ${product.category.name}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:min-w-[15rem] sm:justify-end sm:gap-6">
        <div className="inline-flex items-center rounded-md border border-border/80 bg-muted/30 p-0.5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-background"
            onClick={() => changeQty(quantity - 1)}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(event) => {
              if (event.target.value === "") {
                return
              }
              changeQty(Number(event.target.value))
            }}
            onBlur={() => {
              if (quantity < 1) {
                changeQty(1)
              }
            }}
            aria-label={`Quantity for ${product.name}`}
            className="h-8 w-12 [appearance:textfield] bg-transparent text-center text-sm font-medium tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-background disabled:opacity-40"
            disabled={quantity >= maxQty}
            onClick={() => changeQty(quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <p className="text-sm font-medium tabular-nums sm:min-w-[5rem] sm:text-right">{formatPrice(lineTotal)}</p>
      </div>
    </div>
  )
}
