import type { QueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/query-keys"
import type { Cart, CartItem } from "@/lib/types/cart"

export function getCartQueryKey() {
  return queryKeys.cart
}

export async function snapshotCart(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: getCartQueryKey() })
  return queryClient.getQueryData<Cart>(getCartQueryKey())
}

export function setCart(queryClient: QueryClient, cart: Cart) {
  queryClient.setQueryData(getCartQueryKey(), cart)
}

export function restoreCart(queryClient: QueryClient, previous: Cart | undefined) {
  if (previous) {
    queryClient.setQueryData(getCartQueryKey(), previous)
  }
}

export function patchCartItemQuantity(
  cart: Cart,
  productId: string,
  quantity: number,
): Cart {
  if (quantity < 1) {
    return {
      ...cart,
      cartItems: cart.cartItems.filter((line) => line.productId !== productId),
    }
  }

  return {
    ...cart,
    cartItems: cart.cartItems.map((line) =>
      line.productId === productId ? { ...line, quantity } : line,
    ),
  }
}

export function bumpCartItemQuantity(cart: Cart, productId: string, delta: number): Cart {
  const existing = cart.cartItems.find((line) => line.productId === productId)
  if (existing) {
    return patchCartItemQuantity(cart, productId, existing.quantity + delta)
  }

  if (delta <= 0) {
    return cart
  }

  const placeholder: CartItem = {
    id: `optimistic-${productId}`,
    productId,
    quantity: delta,
    cartId: cart.id,
  }

  return {
    ...cart,
    cartItems: [...cart.cartItems, placeholder],
  }
}
