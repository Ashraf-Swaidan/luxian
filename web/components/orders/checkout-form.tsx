"use client"

import {
  ArrowLeftIcon,
  CheckmarkCircle02Icon,
  PackageIcon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { OrderLineRow } from "@/components/orders/order-line-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/features/cart/hooks"
import { useCheckout } from "@/features/orders/hooks"
import { formatCartSubtotal } from "@/lib/cart-utils"
import { toastApiError } from "@/lib/error-message"

export function CheckoutForm() {
  const { data: cart, isPending, isError } = useCart()
  const checkout = useCheckout()
  const [shippingAddress, setShippingAddress] = useState("")

  if (isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Could not load your bag.{" "}
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

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = () => {
    checkout.mutate(
      { shippingAddress: shippingAddress.trim() || undefined },
      {
        onError: (error) => toastApiError(error, "Checkout failed"),
      }
    )
  }

  return (
    <div className="space-y-5">
      <Button variant="outline" asChild className="w-fit bg-white">
        <Link href="/cart">
          <HugeiconsIcon icon={ArrowLeftIcon} className="size-4" strokeWidth={1.8} />
          Back to cart
        </Link>
      </Button>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-start">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <CheckoutBenefit icon={CheckmarkCircle02Icon} label="Fast confirmation" />
            <CheckoutBenefit icon={PackageIcon} label="Easy order tracking" />
            <CheckoutBenefit icon={ShoppingBag01Icon} label="Stock reserved" />
          </div>

          <section className="bg-white p-4 ring-1 ring-border/50 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 1</p>
                <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">
                  Delivery note
                </h2>
              </div>
              <HugeiconsIcon icon={PackageIcon} className="size-7 text-neutral-950" strokeWidth={1.7} />
            </div>
            <div className="space-y-2">
              <label htmlFor="shipping" className="text-sm font-medium">
                Shipping address
              </label>
              <textarea
                id="shipping"
                rows={3}
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                placeholder="Add your address or delivery note"
                className="w-full resize-none border-x-0 border-t-0 bg-transparent px-0 py-2 text-sm leading-relaxed ring-0 outline-none placeholder:text-muted-foreground focus:border-foreground sm:py-3"
              />
              <p className="text-xs text-muted-foreground">
                This is optional for now. You can still place the order without it.
              </p>
            </div>
          </section>

          <section className="bg-white p-6 ring-1 ring-border/50">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 2</p>
                <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">
                  Review items
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="divide-y divide-border/60">
              {items.map((item) => {
                const product = item.product
                if (!product) {
                  return null
                }
                const unit = Number.parseFloat(product.price)
                return (
                  <OrderLineRow
                    key={item.id}
                    productId={item.productId}
                    name={product.name}
                    imageUrl={product.imageUrl}
                    quantity={item.quantity}
                    unitPrice={product.price}
                    lineTotal={unit * item.quantity}
                    className="py-4"
                  />
                )
              })}
            </div>
          </section>
        </div>

        <aside className="sticky top-24 space-y-5 bg-neutral-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Secure checkout preview</p>
              <h2 className="mt-2 font-display text-4xl leading-none font-bold uppercase">Order summary</h2>
            </div>
            <HugeiconsIcon icon={ShoppingCart01Icon} className="size-7" strokeWidth={1.7} />
          </div>

          <div className="space-y-3 border-y border-white/15 py-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCartSubtotal(cart)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Confirmation</span>
              <span>Instant</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/70">
            Your items are reserved when the order is placed. You can track everything from your orders page right after
            confirmation.
          </p>

          <button
            type="button"
            disabled={checkout.isPending}
            onClick={placeOrder}
            className="luxian-cta w-full bg-white text-center text-neutral-950 disabled:opacity-50"
          >
            {checkout.isPending ? "Placing order..." : "Place order"}
          </button>
        </aside>
      </div>
    </div>
  )
}

function CheckoutBenefit({ icon, label }: { icon: Parameters<typeof HugeiconsIcon>[0]["icon"]; label: string }) {
  return (
    <div className="flex min-h-16 flex-col justify-between gap-2 bg-[oklch(0.94_0.04_95)] p-2 text-neutral-950 sm:min-h-24 sm:flex-row sm:items-end sm:gap-4 sm:p-4">
      <p className="text-[11px] leading-tight font-medium sm:text-sm">{label}</p>
      <HugeiconsIcon icon={icon} className="size-4 shrink-0 sm:size-6" strokeWidth={1.7} />
    </div>
  )
}
