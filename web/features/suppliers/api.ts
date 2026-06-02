import { api } from "@/lib/api-client"
import type { Supplier, SupplierOrder, SupplierOrderStatus } from "@/lib/types/supplier"

export type SupplierInput = {
  name: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  notes?: string | null
  isActive?: boolean
}

export type SupplierOrderInput = {
  supplierId: string
  notes?: string | null
  items: Array<{
    productId: string
    quantity: number
    unitCost: number
  }>
}

export function getSuppliersRequest() {
  return api.get<Supplier[]>("suppliers")
}

export function createSupplierRequest(body: SupplierInput) {
  return api.post<Supplier>("suppliers", body)
}

export function updateSupplierRequest(id: string, body: Partial<SupplierInput>) {
  return api.patch<Supplier>(`suppliers/${id}`, body)
}

export function deactivateSupplierRequest(id: string) {
  return api.delete<Supplier>(`suppliers/${id}`)
}

export function getSupplierOrdersRequest(status?: SupplierOrderStatus | "ALL") {
  const qs = status && status !== "ALL" ? `?status=${status}` : ""
  return api.get<SupplierOrder[]>(`supplier-orders${qs}`)
}

export function createSupplierOrderRequest(body: SupplierOrderInput) {
  return api.post<SupplierOrder>("supplier-orders", body)
}

export function updateSupplierOrderRequest(id: string, body: SupplierOrderInput) {
  return api.patch<SupplierOrder>(`supplier-orders/${id}`, body)
}

export function receiveSupplierOrderRequest(id: string) {
  return api.post<SupplierOrder>(`supplier-orders/${id}/receive`)
}

export function cancelSupplierOrderRequest(id: string) {
  return api.post<SupplierOrder>(`supplier-orders/${id}/cancel`)
}
