import type { Product } from "@/lib/types/product"

export type Supplier = {
  id: string
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SupplierOrderStatus = "ON_THE_WAY" | "RECEIVED" | "CANCELLED"

export type SupplierOrderItem = {
  id: string
  supplierOrderId: string
  productId: string
  quantity: number
  unitCost: string
  product: Product
}

export type SupplierOrder = {
  id: string
  orderNumber: string
  supplierId: string
  supplier: Supplier
  status: SupplierOrderStatus
  notes: string | null
  items: SupplierOrderItem[]
  receivedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}
