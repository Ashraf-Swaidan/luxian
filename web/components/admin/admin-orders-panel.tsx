"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { getAdminOrdersRequest, updateAdminOrderStatusRequest } from "@/features/orders/api"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import type { Order, OrderStatus } from "@/lib/types/order"

const ORDER_FILTERS: Array<OrderStatus | "ALL"> = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "ALL"]

export function AdminOrdersPanel() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<OrderStatus | "ALL">("PROCESSING")
  const { data: orders, isPending } = useQuery({
    queryKey: queryKeys.orders.admin(status),
    queryFn: () => getAdminOrdersRequest(status),
  })

  const transition = useMutation({
    mutationFn: ({ id, restock, status }: { id: string; status: OrderStatus; restock?: boolean }) =>
      updateAdminOrderStatusRequest(id, { status, restock }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", "admin"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success("Order updated")
    },
    onError: (error) => toastApiError(error),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium">Order workflow</h2>
          <p className="text-sm text-muted-foreground">Move orders through shipping, delivery, cancellation, and restock.</p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | "ALL")}
          className="h-10 bg-white px-3 text-sm ring-1 ring-border/60"
        >
          {ORDER_FILTERS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : orders?.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} onTransition={(input) => transition.mutate(input)} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No orders found for this filter.</p>
      )}
    </div>
  )
}

function AdminOrderCard({
  onTransition,
  order,
}: {
  onTransition: (input: { id: string; status: OrderStatus; restock?: boolean }) => void
  order: Order
}) {
  const [restock, setRestock] = useState(true)
  const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ") || order.user?.email || "Customer"
  const profit = order.orderItems.reduce(
    (sum, item) => sum + (Number(item.price) - Number(item.costAtSale)) * item.quantity,
    0,
  )

  return (
    <article className="space-y-5 bg-white p-5 ring-1 ring-border/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{order.status}</p>
          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">{customerName}</p>
        </div>
        <div className="text-sm sm:text-right">
          <p className="font-medium">{formatPrice(order.totalAmount)}</p>
          <p className={profit >= 0 ? "text-xs text-emerald-700" : "text-xs text-red-700"}>Profit {formatPrice(String(profit))}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {order.orderItems.map((item) => (
          <div key={item.id} className="grid gap-2 border-t border-border/60 pt-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <span>{item.product.name}</span>
            <span className="tabular-nums">Qty {item.quantity}</span>
            <span className="tabular-nums">{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>

      {order.shippingAddress && (
        <p className="bg-muted/30 p-3 text-sm text-muted-foreground">{order.shippingAddress}</p>
      )}

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {(order.status === "PROCESSING" || order.status === "SHIPPED") && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={restock} onChange={(event) => setRestock(event.target.checked)} />
            Restock items if cancelled
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {order.status === "PROCESSING" && (
            <>
              <Button size="sm" onClick={() => onTransition({ id: order.id, status: "SHIPPED" })}>
                Mark shipped
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onTransition({ id: order.id, status: "CANCELLED", restock })}>
                Cancel
              </Button>
            </>
          )}
          {order.status === "SHIPPED" && (
            <>
              <Button size="sm" onClick={() => onTransition({ id: order.id, status: "DELIVERED" })}>
                Mark delivered
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onTransition({ id: order.id, status: "CANCELLED", restock })}>
                Cancel
              </Button>
            </>
          )}
          {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
            <span className="text-sm text-muted-foreground">Final state</span>
          )}
        </div>
      </div>
    </article>
  )
}
