"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/features/cart/api"
import { queryKeys } from "@/lib/query-keys"
import { useAuth } from "@/providers/auth-provider"

export function useCart() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: !!user,
  })
}

export function useCartItemCount() {
  const { data } = useCart()
  return data?.cartItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

function useInvalidateCart() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
  }
}

export function useAddToCart() {
  const invalidate = useInvalidateCart()

  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string
      quantity?: number
    }) => addCartItem(productId, quantity),
    onSuccess: invalidate,
  })
}

export function useUpdateCartItem() {
  const invalidate = useInvalidateCart()

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string
      quantity: number
    }) => updateCartItem(productId, quantity),
    onSuccess: invalidate,
  })
}

export function useRemoveCartItem() {
  const invalidate = useInvalidateCart()

  return useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      removeCartItem(productId),
    onSuccess: invalidate,
  })
}
