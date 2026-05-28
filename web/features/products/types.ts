import type { Paginated } from "@/lib/types/paginated"
import type { Product } from "@/lib/types/product"

export type PaginatedProducts = Paginated<Product>

export type ProductListParams = {
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}
