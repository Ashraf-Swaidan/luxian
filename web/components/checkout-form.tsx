"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/features/cart/hooks"
import { useCheckout } from "@/features/orders/hooks"
import { EmptyState } from "@/components/empty-state"
import { toastApiError } from "@/lib/error-message"
import { formatCartSubtotal } from "@/lib/cart-utils"
import { formatPrice } from "@/lib/format-price"

export function CheckoutForm() {
  const { data: cart, isPending, isError } = useCart()
  const checkout = useCheckout()
  const [shippingAddress, setShippingAddress] = useState("")

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load your cart.{" "}
        <Link href="/cart" className="underline">
          Return to cart
        </Link>
      </p>
    )
  }

  const items = cart?.cartItems ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        description="Add items before checkout, or you may have already placed your order."
        actionLabel="Back to shop"
        actionHref="/products"
      />
    )
  }

  const placeOrder = () => {
    checkout.mutate(
      { shippingAddress: shippingAddress.trim() || undefined },
      {
        onError: (error) => toastApiError(error, "Checkout failed"),
      },
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>Optional — stub payment does not require it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="shipping">Address</Label>
              <textarea
                id="shipping"
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="123 Main St, City"
                className="flex w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const unit = Number.parseFloat(item.product?.price ?? "0")
              return (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span>
                    {item.product?.name ?? "Product"} × {item.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatPrice(unit * item.quantity)}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="font-medium">Order total</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCartSubtotal(cart)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Payment is simulated (stub). Stock is reserved when you place the order.
        </p>
        <button
          type="button"
          disabled={checkout.isPending}
          onClick={placeOrder}
          className="luxian-cta luxian-cta-ring w-full disabled:opacity-50"
        >
          {checkout.isPending ? "Placing order…" : "Place order"}
        </button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/cart">Back to cart</Link>
        </Button>
      </aside>
    </div>
  )
}
