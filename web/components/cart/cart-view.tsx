"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart/cart-line-item"
import { EmptyState } from "@/components/common/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/features/cart/hooks"
import { formatCartSubtotal } from "@/lib/cart-utils"

export function CartView() {
  const { data: cart, isPending, isError } = useCart()

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load your bag. Try refreshing the page.
      </p>
    )
  }

  const items = cart?.cartItems ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Browse the shop and add items — they will appear here instantly."
        actionLabel="Shop now"
        actionHref="/products"
      />
    )
  }

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
      <section>
        <p className="mb-2 text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
        <div className="rounded-md border border-border/60 bg-card px-4 sm:px-6">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      <aside className="sticky top-20 space-y-4 rounded-md border border-border/60 bg-card p-6">
        <h2 className="text-lg font-medium">Order summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">{formatCartSubtotal(cart)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes calculated at checkout.
        </p>
        <Link href="/checkout" className="luxian-cta luxian-cta-ring w-full text-center">
          Checkout
        </Link>
        <Link
          href="/products"
          className="block text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  )
}
