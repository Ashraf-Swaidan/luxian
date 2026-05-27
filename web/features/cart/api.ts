import { api } from "@/lib/api-client"
import type { Cart } from "@/lib/types/cart"

export function getCart() {
  return api.get<Cart>("cart")
}

export function addCartItem(productId: string, quantity = 1) {
  return api.post<Cart>("cart/items", { productId, quantity })
}

export function updateCartItem(productId: string, quantity: number) {
  return api.patch<Cart>(`cart/items/${productId}`, { quantity })
}

export function removeCartItem(productId: string) {
  return api.delete<Cart>(`cart/items/${productId}`)
}
