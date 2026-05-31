"use client"

import Link from "next/link"

import { EmptyState } from "@/components/common/empty-state"
import { LineItemThumb } from "@/components/common/line-item-thumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders } from "@/features/orders/hooks"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types/order"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function OrderRow({ order }: { order: Order }) {
  const previewItems = order.orderItems.slice(0, 3)
  const overflowCount = order.orderItems.length - previewItems.length

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="flex flex-col gap-4 rounded-md border border-border/60 bg-card p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="flex shrink-0 items-center">
          {previewItems.map((item, index) => (
            <div
              key={item.id}
              className={cn("relative rounded-md ring-2 ring-card", index > 0 && "-ml-2.5")}
              style={{ zIndex: previewItems.length - index }}
            >
              <LineItemThumb
                name={item.product?.name ?? "Product"}
                imageUrl={item.product?.imageUrl}
                size="xs"
              />
            </div>
          ))}
          {overflowCount > 0 && (
            <div
              className="relative z-0 -ml-2.5 flex size-8 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card"
              aria-label={`${overflowCount} more items`}
            >
              +{overflowCount}
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-1 self-center">
          <p className="font-medium">Order {order.orderNumber}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)} · {order.orderItems.length} item
            {order.orderItems.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm sm:shrink-0">
        <span className="rounded-sm bg-muted px-2.5 py-0.5 text-xs font-medium">
          {order.status}
        </span>
        <span className="font-medium tabular-nums">{formatPrice(order.totalAmount)}</span>
      </div>
    </Link>
  )
}

export function OrdersList() {
  const { data: orders, isPending, isError } = useOrders()

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Could not load your orders.</p>
    )
  }

  if (!orders?.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you complete checkout, your orders will appear here."
        actionLabel="Start shopping"
        actionHref="/products"
      />
    )
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderRow order={order} />
        </li>
      ))}
    </ul>
  )
}
