import type { Product } from "@/lib/types/product"

export type CollectionProduct = {
  id: string
  position: number
  collectionId: string
  productId: string
  product: Product
}

export type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  collectionProducts?: CollectionProduct[]
  createdAt: string
  updatedAt: string
}
