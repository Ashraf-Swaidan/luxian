import { api } from "@/lib/api-client"
import type { CheckoutInput, Order } from "@/lib/types/order"

export function checkoutRequest(body: CheckoutInput = {}) {
  return api.post<Order>("orders/checkout", body)
}

export function getOrdersRequest() {
  return api.get<Order[]>("orders")
}

export function getOrderRequest(id: string) {
  return api.get<Order>(`orders/${id}`)
}
