"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart-line-item"
import { EmptyState } from "@/components/empty-state"
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
        Could not load your cart. Try refreshing the page.
      </p>
    )
  }

  const items = cart?.cartItems ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something from the shop, then return here to checkout."
        actionLabel="Browse products"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <ul className="divide-y divide-border/60">
        {items.map((item) => (
          <CartLineItem key={item.id} item={item} />
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="font-medium">Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCartSubtotal(cart)}</span>
        </div>
        <Link href="/checkout" className="luxian-cta luxian-cta-ring w-full text-center">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  )
}
