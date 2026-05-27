"use client"

import Link from "next/link"
import { toast } from "sonner"

import { useRemoveCartItem, useUpdateCartItem } from "@/features/cart/hooks"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import type { CartItem } from "@/lib/types/cart"
type CartLineItemProps = {
  item: CartItem
}

export function CartLineItem({ item }: CartLineItemProps) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const product = item.product
  if (!product) {
    return null
  }

  const unitPrice = Number.parseFloat(product.price)
  const lineTotal = unitPrice * item.quantity
  const maxQty = product.stock

  const mutateOpts = {
    onError: (error: unknown) => toastApiError(error),
  }

  const changeQty = (next: number) => {
    if (next < 1) {
      removeItem.mutate({ productId: item.productId }, mutateOpts)
      return
    }
    if (next > maxQty) {
      toast.error(`Only ${maxQty} in stock`)
      return
    }
    updateItem.mutate({ productId: item.productId, quantity: next }, mutateOpts)
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border/50 py-5 sm:grid-cols-[minmax(0,1fr)_140px_100px_80px] sm:items-center">
      <div className="min-w-0 space-y-1">
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

      <div className="flex items-center justify-end sm:justify-center">
        <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/30 p-0.5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-background"
            onClick={() => changeQty(item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm font-medium tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-background disabled:opacity-40"
            disabled={item.quantity >= maxQty}
            onClick={() => changeQty(item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-right text-sm font-medium tabular-nums sm:text-base">
        {formatPrice(lineTotal)}
      </p>

      <button
        type="button"
        className="text-right text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
        onClick={() => removeItem.mutate({ productId: item.productId }, mutateOpts)}
      >
        Remove
      </button>
    </div>
  )
}
