import type { QueryClient } from "@tanstack/react-query"

import {
  getCartQueryKey,
  patchCartItemQuantity,
  setCart,
} from "@/features/cart/cart-cache"
import { removeCartItem, updateCartItem } from "@/features/cart/api"
import type { Cart } from "@/lib/types/cart"

type LineQueue = {
  targetQuantity: number
  draining: boolean
}

const lineQueues = new Map<string, LineQueue>()

type SyncHandlers = {
  onError?: (error: unknown) => void
}

export function scheduleCartLineQuantity(
  queryClient: QueryClient,
  productId: string,
  quantity: number,
  handlers?: SyncHandlers,
) {
  const cart = queryClient.getQueryData<Cart>(getCartQueryKey())
  if (cart) {
    setCart(
      queryClient,
      quantity < 1
        ? patchCartItemQuantity(cart, productId, 0)
        : patchCartItemQuantity(cart, productId, quantity),
    )
  }

  const existing = lineQueues.get(productId)
  if (existing) {
    existing.targetQuantity = quantity
  } else {
    lineQueues.set(productId, { targetQuantity: quantity, draining: false })
  }

  const queue = lineQueues.get(productId)!
  if (!queue.draining) {
    void drainCartLineQueue(queryClient, productId, handlers)
  }
}

async function drainCartLineQueue(
  queryClient: QueryClient,
  productId: string,
  handlers?: SyncHandlers,
) {
  const queue = lineQueues.get(productId)
  if (!queue || queue.draining) {
    return
  }

  queue.draining = true

  try {
    while (lineQueues.has(productId)) {
      const state = lineQueues.get(productId)!
      const quantity = state.targetQuantity

      const data =
        quantity < 1
          ? await removeCartItem(productId)
          : await updateCartItem(productId, quantity)

      const latest = lineQueues.get(productId)

      if (!latest || latest.targetQuantity === quantity) {
        setCart(queryClient, data)
        lineQueues.delete(productId)
        return
      }

      // User clicked again while this request was in flight — send the newer target next.
    }
  } catch (error) {
    lineQueues.delete(productId)
    handlers?.onError?.(error)
    void queryClient.invalidateQueries({ queryKey: getCartQueryKey() })
  } finally {
    const remaining = lineQueues.get(productId)
    if (remaining) {
      remaining.draining = false
      if (lineQueues.has(productId)) {
        void drainCartLineQueue(queryClient, productId, handlers)
      }
    }
  }
}

export function getCartLineQuantity(
  queryClient: QueryClient,
  productId: string,
  fallback = 0,
) {
  const pending = lineQueues.get(productId)?.targetQuantity
  if (pending !== undefined) {
    return pending
  }

  const cart = queryClient.getQueryData<Cart>(getCartQueryKey())
  const line = cart?.cartItems.find((item) => item.productId === productId)
  return line?.quantity ?? fallback
}
