"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  bumpCartItemQuantity,
  patchCartItemQuantity,
  restoreCart,
  setCart,
  snapshotCart,
} from "@/features/cart/cart-cache"
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/features/cart/api"
import { queryKeys } from "@/lib/query-keys"
import type { Cart } from "@/lib/types/cart"
import { useAuth } from "@/providers/auth-provider"

export function useCart() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: !!user,
    staleTime: 60_000,
  })
}

export function useCartItemCount() {
  const { data } = useCart()
  return data?.cartItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

function useCartCacheMutation<TVariables>(
  options: {
    mutationFn: (variables: TVariables) => Promise<Cart>
    onOptimistic?: (cart: Cart, variables: TVariables) => Cart
  },
) {
  const queryClient = useQueryClient()

  return useMutation<Cart, Error, TVariables, { previous: Cart | undefined }>({
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      const previous = await snapshotCart(queryClient)
      if (previous && options.onOptimistic) {
        setCart(queryClient, options.onOptimistic(previous, variables))
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      restoreCart(queryClient, context?.previous)
    },
    onSuccess: (data) => {
      setCart(queryClient, data)
    },
  })
}

type AddToCartVariables = { productId: string; quantity?: number }
type CartItemVariables = { productId: string; quantity: number }
type RemoveCartItemVariables = { productId: string }

export function useAddToCart() {
  return useCartCacheMutation<AddToCartVariables>({
    mutationFn: ({ productId, quantity = 1 }) => addCartItem(productId, quantity),
    onOptimistic: (cart, { productId, quantity = 1 }) =>
      bumpCartItemQuantity(cart, productId, quantity),
  })
}

export function useUpdateCartItem() {
  return useCartCacheMutation<CartItemVariables>({
    mutationFn: ({ productId, quantity }) => updateCartItem(productId, quantity),
    onOptimistic: (cart, { productId, quantity }) =>
      patchCartItemQuantity(cart, productId, quantity),
  })
}

export function useRemoveCartItem() {
  return useCartCacheMutation<RemoveCartItemVariables>({
    mutationFn: ({ productId }) => removeCartItem(productId),
    onOptimistic: (cart, { productId }) => patchCartItemQuantity(cart, productId, 0),
  })
}
