import type { Paginated } from "@/lib/types/paginated"
import type { Product } from "@/lib/types/product"

export type PaginatedProducts = Paginated<Product>

export type ProductListParams = {
  search?: string
  categoryId?: string
  collectionId?: string
  collectionSlug?: string
  minPrice?: number
  maxPrice?: number
  minStock?: number
  maxStock?: number
  page?: number
  limit?: number
}
