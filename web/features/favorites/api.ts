import { api } from "@/lib/api-client"
import type { FavoriteProduct, FavoriteStatus } from "@/lib/types/favorite"

export function getFavorites() {
  return api.get<FavoriteProduct[]>("favorites")
}

export function getFavoriteStatus(productId: string) {
  return api.get<FavoriteStatus>(`favorites/${productId}`)
}

export function toggleFavorite(productId: string) {
  return api.patch<FavoriteStatus>(`favorites/${productId}/toggle`)
}
