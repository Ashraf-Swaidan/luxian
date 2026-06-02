import { api } from "@/lib/api-client"
import type { CheckoutInput, Order, OrderStatus } from "@/lib/types/order"

export function checkoutRequest(body: CheckoutInput = {}) {
  return api.post<Order>("orders/checkout", body)
}

export function getOrdersRequest() {
  return api.get<Order[]>("orders")
}

export function getOrderRequest(id: string) {
  return api.get<Order>(`orders/${id}`)
}

export function getAdminOrdersRequest(status?: OrderStatus | "ALL") {
  const qs = status && status !== "ALL" ? `?status=${status}` : ""
  return api.get<Order[]>(`orders/admin${qs}`)
}

export function getAdminOrderRequest(id: string) {
  return api.get<Order>(`orders/admin/${id}`)
}

export function updateAdminOrderStatusRequest(
  id: string,
  body: { status: OrderStatus; restock?: boolean },
) {
  return api.patch<Order>(`orders/admin/${id}/status`, body)
}
