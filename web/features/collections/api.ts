import { api } from "@/lib/api-client"
import type { Collection } from "@/lib/types/collection"

export type CreateCollectionInput = {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  isActive?: boolean
}

export type UpdateCollectionInput = {
  name?: string
  slug?: string
  description?: string | null
  imageUrl?: string | null
  isActive?: boolean
}

export function getCollections() {
  return api.get<Collection[]>("collections", { auth: false })
}

export function getCollectionsForAdmin() {
  return api.get<Collection[]>("collections/admin/list")
}

export function getCollection(identifier: string) {
  return api.get<Collection>(`collections/${identifier}`, { auth: false })
}

export function createCollection(body: CreateCollectionInput) {
  return api.post<Collection>("collections", body)
}

export function updateCollection(id: string, body: UpdateCollectionInput) {
  return api.patch<Collection>(`collections/${id}`, body)
}

export function deactivateCollection(id: string) {
  return api.delete<Collection>(`collections/${id}`)
}

export function addCollectionProduct(collectionId: string, productId: string) {
  return api.post<Collection>(`collections/${collectionId}/products`, { productId })
}

export function addCollectionProducts(collectionId: string, productIds: string[]) {
  return api.post<Collection>(`collections/${collectionId}/products/bulk`, { productIds })
}

export function removeCollectionProduct(collectionId: string, productId: string) {
  return api.delete<Collection>(`collections/${collectionId}/products/${productId}`)
}

export function reorderCollectionProducts(collectionId: string, productIds: string[]) {
  return api.patch<Collection>(`collections/${collectionId}/products/reorder`, {
    productIds,
  })
}
