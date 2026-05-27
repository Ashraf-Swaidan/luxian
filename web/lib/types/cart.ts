import type { Product } from "@/lib/types/product"

export type CartItem = {
  id: string
  quantity: number
  productId: string
  cartId: string
  product: Product
}

export type Cart = {
  id: string
  userId: string
  checkedOut: boolean
  cartItems: CartItem[]
  createdAt: string
  updatedAt: string
}
