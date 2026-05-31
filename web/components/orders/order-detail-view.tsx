"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { OrderLineRow } from "@/components/orders/order-line-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrder } from "@/features/orders/hooks"
import { formatPrice } from "@/lib/format-price"

export function OrderDetailView() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const { data: order, isPending, isError } = useOrder(id)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Order not found.</p>
        <Button variant="outline" asChild>
          <Link href="/account/orders">All orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/account/orders" className="hover:underline">
            Orders
          </Link>
          <span className="mx-2">/</span>
          {order.orderNumber}
        </p>
        <h1 className="text-2xl font-medium tracking-tight">Order confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Status <span className="text-foreground">{order.status}</span>
          {order.payment && (
            <>
              {" "}
              · Payment{" "}
              <span className="text-foreground">{order.payment.status}</span>
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-md border border-border/60 bg-card p-6">
          <h2 className="font-medium">Items</h2>
          <ul className="space-y-4">
            {order.orderItems.map((item) => (
              <li key={item.id}>
                <OrderLineRow
                  productId={item.productId}
                  name={item.product?.name ?? "Product"}
                  imageUrl={item.product?.imageUrl}
                  quantity={item.quantity}
                  unitPrice={item.price}
                  lineTotal={Number.parseFloat(item.price) * item.quantity}
                  className="py-0"
                />
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border/60 pt-5 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.totalAmount)}</span>
          </div>
        </section>

        <section className="space-y-4 rounded-md border border-border/60 bg-card p-6">
          <h2 className="font-medium">Details</h2>
          {order.shippingAddress ? (
            <div className="text-sm">
              <p className="text-muted-foreground">Shipping</p>
              <p className="mt-1">{order.shippingAddress}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipping address provided.</p>
          )}
          {order.payment && (
            <div className="text-sm">
              <p className="text-muted-foreground">Payment</p>
              <p className="mt-1">
                {order.payment.paymentMethod ?? "—"} · {order.payment.transactionId}
              </p>
            </div>
          )}
        </section>
      </div>

      <Button variant="outline" asChild>
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  )
}
