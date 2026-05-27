import { api } from "@/lib/api-client"
import type { Product } from "@/lib/types/product"

export function getProducts(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""
  return api.get<Product[]>(`products${query}`, { auth: false })
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
