import { api } from "@/lib/api-client"
import type { Product } from "@/lib/types/product"
import type { PaginatedProducts, ProductListParams } from "@/features/products/types"

function buildProductsQuery(params?: ProductListParams) {
  if (!params) {
    return ""
  }

  const search = new URLSearchParams()

  if (params.search?.trim()) {
    search.set("search", params.search.trim())
  }
  if (params.categoryId) {
    search.set("categoryId", params.categoryId)
  }
  if (params.collectionId) {
    search.set("collectionId", params.collectionId)
  }
  if (params.collectionSlug) {
    search.set("collectionSlug", params.collectionSlug)
  }
  if (params.minPrice !== undefined) {
    search.set("minPrice", String(params.minPrice))
  }
  if (params.maxPrice !== undefined) {
    search.set("maxPrice", String(params.maxPrice))
  }
  if (params.minStock !== undefined) {
    search.set("minStock", String(params.minStock))
  }
  if (params.maxStock !== undefined) {
    search.set("maxStock", String(params.maxStock))
  }
  if (params.page !== undefined) {
    search.set("page", String(params.page))
  }
  if (params.limit !== undefined) {
    search.set("limit", String(params.limit))
  }

  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export function getProducts(params?: ProductListParams) {
  return api.get<PaginatedProducts>(`products${buildProductsQuery(params)}`, {
    auth: false,
  })
}

export function getProduct(id: string) {
  return api.get<Product>(`products/${id}`, { auth: false })
}

/** Admin — fetch first page at API max page size */
export function getProductsBulk(limit = 48) {
  return getProducts({ page: 1, limit })
}

export type CreateProductInput = {
  name: string
  sku: string
  price: number
  stock?: number
  categoryId: string
  description?: string
  imageUrl?: string
  isActive?: boolean
}

export type UpdateProductInput = Partial<Omit<CreateProductInput, "imageUrl">> & {
  imageUrl?: string | null
}

export function createProduct(body: CreateProductInput) {
  return api.post<Product>("products", body)
}

export function updateProduct(id: string, body: UpdateProductInput) {
  return api.patch<Product>(`products/${id}`, body)
}

export function deactivateProduct(id: string) {
  return api.delete<Product>(`products/${id}`)
}
