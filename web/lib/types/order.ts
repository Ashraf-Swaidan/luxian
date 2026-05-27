import type { Product } from "@/lib/types/product"

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export type OrderItem = {
  id: string
  quantity: number
  price: string
  productId: string
  product: Product
}

export type Payment = {
  id: string
  amount: string
  status: PaymentStatus
  currency: string
  paymentMethod: string | null
  transactionId: string | null
}

export type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: string
  shippingAddress: string | null
  orderItems: OrderItem[]
  payment: Payment | null
  createdAt: string
  updatedAt: string
}

export type CheckoutInput = {
  shippingAddress?: string
}
