import type { Category } from "@/lib/types/category"

export type { Category }

export type ProductImage = {
  id: string
  url: string
  key: string | null
  altText: string | null
  position: number
}

export type Product = {
  id: string
  name: string
  description: string | null
  price: string
  stock: number
  sku: string
  imageUrl: string | null
  isActive: boolean
  categoryId: string
  category?: Category
  images?: ProductImage[]
}
