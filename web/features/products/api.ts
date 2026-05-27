import { api } from "@/lib/api-client"
import type { Product } from "@/lib/types/product"

export function getProducts(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""
  return api.get<Product[]>(`products${query}`, { auth: false })
}
