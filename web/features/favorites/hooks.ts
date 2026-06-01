"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getFavorites, getFavoriteStatus, toggleFavorite } from "@/features/favorites/api"
import { queryKeys } from "@/lib/query-keys"
import type { FavoriteProduct, FavoriteStatus } from "@/lib/types/favorite"
import { useAuth } from "@/providers/auth-provider"

export function useFavorites() {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: getFavorites,
    enabled: !!user,
    staleTime: 60_000,
  })
}

export function useFavoriteStatus(productId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: queryKeys.favorites.status(productId),
    queryFn: () => getFavoriteStatus(productId),
    enabled: !!user && Boolean(productId),
    staleTime: 60_000,
  })
}

export function useToggleFavorite(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleFavorite(productId),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.favorites.status(productId) }),
        queryClient.cancelQueries({ queryKey: queryKeys.favorites.all }),
      ])

      const previousStatus = queryClient.getQueryData<FavoriteStatus>(queryKeys.favorites.status(productId))
      const previousFavorites = queryClient.getQueryData<FavoriteProduct[]>(queryKeys.favorites.all)
      const nextIsFavorite = !previousStatus?.isFavorite

      if (previousStatus) {
        queryClient.setQueryData<FavoriteStatus>(queryKeys.favorites.status(productId), {
          ...previousStatus,
          isFavorite: nextIsFavorite,
        })
      }

      return { previousStatus, previousFavorites }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(queryKeys.favorites.status(productId), context.previousStatus)
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.all, context.previousFavorites)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.favorites.status(productId), data)
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
    },
  })
}
