"use client"

import type { Order } from "@/lib/types/order"
import { formatPrice } from "@/lib/format-price"

import { customerLabel, orderStatusClass, ViewAllLink } from "./dashboard-shared"

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
              <th className="pb-3 pr-4 font-medium">Order</th>
              <th className="pb-3 pr-4 font-medium">Customer</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">Total</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/40 last:border-0">
                <td className="py-3 pr-4 font-medium">{order.orderNumber}</td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {order.user ? customerLabel(order.user) : "Customer"}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium uppercase ${orderStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 tabular-nums">{formatPrice(order.totalAmount)}</td>
                <td className="py-3 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ViewAllLink href="/admin/orders" label="View all orders" />
    </div>
  )
}
