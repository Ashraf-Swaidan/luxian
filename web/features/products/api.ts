import { api } from "@/lib/api-client"
import { getVisitorIdHeaders } from "@/lib/visitor-id"
import type { Collection } from "@/lib/types/collection"
import type { Product, ProductImage, StockMovement } from "@/lib/types/product"
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

export function getProducts(params?: ProductListParams, options?: { personalize?: boolean }) {
  const headers = options?.personalize ? getVisitorIdHeaders() : undefined
  return api.get<PaginatedProducts>(`products${buildProductsQuery(params)}`, {
    auth: false,
    headers,
  })
}

export function getProduct(id: string) {
  return api.get<Product>(`products/${id}`, { auth: false })
}

export type ProductContext = {
  product: Product
  collection: Collection | null
  collectionProducts: Product[]
  similarProducts: Product[]
}

export function getProductContext(id: string, params?: { collectionLimit?: number; similarLimit?: number }) {
  const search = new URLSearchParams()
  if (params?.collectionLimit !== undefined) {
    search.set("collectionLimit", String(params.collectionLimit))
  }
  if (params?.similarLimit !== undefined) {
    search.set("similarLimit", String(params.similarLimit))
  }
  const qs = search.toString()
  return api.get<ProductContext>(`products/${id}/context${qs ? `?${qs}` : ""}`, {
    auth: false,
    headers: getVisitorIdHeaders(),
  })
}

/** Admin — fetch first page at API max page size */
export function getProductsBulk(limit = 48) {
  return getProducts({ page: 1, limit })
}

export type CreateProductInput = {
  name: string
  sku: string
  price: number
  cost?: number
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

export function addProductImage(productId: string, body: { url: string; altText?: string }) {
  return api.post<ProductImage>(`products/${productId}/images`, body)
}

export function updateProductImage(productId: string, imageId: string, body: { altText?: string | null }) {
  return api.patch<ProductImage>(`products/${productId}/images/${imageId}`, body)
}

export function reorderProductImages(productId: string, imageIds: string[]) {
  return api.patch<ProductImage[]>(`products/${productId}/images/reorder`, { imageIds })
}

export function deleteProductImage(productId: string, imageId: string) {
  return api.delete<{ id: string; key: string | null }>(`products/${productId}/images/${imageId}`)
}

export function getProductStockMovements(productId: string) {
  return api.get<StockMovement[]>(`products/${productId}/stock-movements`)
}
