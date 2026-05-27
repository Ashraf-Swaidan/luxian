"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  checkoutRequest,
  getOrderRequest,
  getOrdersRequest,
} from "@/features/orders/api"
import { queryKeys } from "@/lib/query-keys"
import type { CheckoutInput } from "@/lib/types/order"
import { useAuth } from "@/providers/auth-provider"

export function useOrders() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: getOrdersRequest,
    enabled: !!user,
  })
}

export function useOrder(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrderRequest(id),
    enabled: !!user && !!id,
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutRequest(input),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      router.replace(`/account/orders/${order.id}`)
    },
  })
}
