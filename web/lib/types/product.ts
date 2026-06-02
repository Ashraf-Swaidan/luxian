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
  cost?: string
  stock: number
  restockLimit: number
  incomingStock?: number
  sku: string
  imageUrl: string | null
  isActive: boolean
  categoryId: string
  category?: Category
  images?: ProductImage[]
}

export type StockMovementType =
  | "SUPPLIER_RECEIVED"
  | "CUSTOMER_ORDER"
  | "ORDER_RESTOCK"

export type StockMovement = {
  id: string
  productId: string
  quantityDelta: number
  type: StockMovementType
  orderId: string | null
  supplierOrderId: string | null
  note: string | null
  createdAt: string
  order?: {
    id: string
    orderNumber: string
    status: string
  } | null
  supplierOrder?: {
    id: string
    orderNumber: string
    status: string
  } | null
}
