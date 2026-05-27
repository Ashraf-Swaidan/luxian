"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart-line-item"
import { Button } from "@/components/ui/button"
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
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
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
