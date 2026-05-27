"use client"

import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders } from "@/features/orders/hooks"
import { formatPrice } from "@/lib/format-price"
import type { Order } from "@/lib/types/order"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <p className="font-medium">Order {order.orderNumber}</p>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.createdAt)} · {order.orderItems.length} item
          {order.orderItems.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
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
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
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
