import type { Product } from "@/lib/types/product"

export type FavoriteProduct = {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: string
}

export type FavoriteStatus = {
  productId: string
  isFavorite: boolean
}
