"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useRemoveCartItem, useUpdateCartItem } from "@/features/cart/hooks"
import { ApiError } from "@/lib/api-client"
import { formatPrice } from "@/lib/format-price"
import type { CartItem } from "@/lib/types/cart"

type CartLineItemProps = {
  item: CartItem
}

function showError(error: unknown) {
  const message =
    error instanceof ApiError
      ? error.messages.join(", ")
      : error instanceof Error
        ? error.message
        : "Something went wrong"
  toast.error(message)
}

export function CartLineItem({ item }: CartLineItemProps) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const product = item.product
  if (!product) {
    return null
  }

  const lineTotal = Number.parseFloat(product.price) * item.quantity
  const maxQty = product.stock
  const categoryLabel = product.category?.name

  const changeQty = (next: number) => {
    if (next < 1) {
      removeItem.mutate({ productId: item.productId }, { onError: showError })
      return
    }
    if (next > maxQty) {
      toast.error(`Only ${maxQty} in stock`)
      return
    }
    updateItem.mutate({ productId: item.productId, quantity: next }, { onError: showError })
  }

  const busy = updateItem.isPending || removeItem.isPending

  return (
    <li className="flex flex-col gap-4 border-b border-border/60 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Link
          href={`/products/${item.productId}`}
          className="font-medium hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatPrice(product.price)} each
          {categoryLabel ? ` · ${categoryLabel}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={busy}
            onClick={() => changeQty(item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            −
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={busy || item.quantity >= maxQty}
            onClick={() => changeQty(item.quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </Button>
        </div>

        <span className="min-w-20 text-right font-medium tabular-nums">
          {formatPrice(lineTotal)}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() =>
            removeItem.mutate({ productId: item.productId }, { onError: showError })
          }
        >
          Remove
        </Button>
      </div>
    </li>
  )
}
