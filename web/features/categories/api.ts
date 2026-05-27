import { api } from "@/lib/api-client"
import type { Category } from "@/lib/types/category"

export function getCategories() {
  return api.get<Category[]>("categories", { auth: false })
}

export type CreateCategoryInput = {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  isActive?: boolean
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export function createCategory(body: CreateCategoryInput) {
  return api.post<Category>("categories", body)
}

export function updateCategory(id: string, body: UpdateCategoryInput) {
  return api.patch<Category>(`categories/${id}`, body)
}

export function deactivateCategory(id: string) {
  return api.delete<Category>(`categories/${id}`)
}
