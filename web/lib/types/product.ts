export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
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
}
