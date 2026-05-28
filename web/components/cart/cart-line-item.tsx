"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
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
    if (next > maxQty) {
      toast.error(`Only ${maxQty} in stock`)
      return
    }
    setLineQuantity(item.productId, next, mutateOpts)
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border/50 py-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <LineItemThumb
          productId={item.productId}
          name={product.name}
          imageUrl={product.imageUrl}
          size="md"
        />
        <div className="min-w-0 space-y-1 self-center">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium hover:text-[var(--luxian-teal)]"
          >
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.price)}
            {product.category?.name ? ` · ${product.category.name}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-6">
        <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/30 p-0.5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-background"
            onClick={() => changeQty(quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
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

        <p className="text-sm font-medium tabular-nums sm:min-w-[5rem] sm:text-right">
          {formatPrice(lineTotal)}
        </p>

        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => setLineQuantity(item.productId, 0, mutateOpts)}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
