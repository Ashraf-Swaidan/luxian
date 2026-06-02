"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  cancelSupplierOrderRequest,
  createSupplierOrderRequest,
  createSupplierRequest,
  deactivateSupplierRequest,
  getSupplierOrdersRequest,
  getSuppliersRequest,
  receiveSupplierOrderRequest,
  updateSupplierRequest,
} from "@/features/suppliers/api"
import type { SupplierInput } from "@/features/suppliers/api"
import { getProductsBulk } from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import type { Supplier, SupplierOrderStatus } from "@/lib/types/supplier"

const ORDER_STATUS: Array<SupplierOrderStatus | "ALL"> = ["ALL", "ON_THE_WAY", "RECEIVED", "CANCELLED"]

export function AdminSuppliersPanel() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SupplierOrderStatus | "ALL">("ALL")

  const { data: suppliers } = useQuery({ queryKey: queryKeys.suppliers.all, queryFn: getSuppliersRequest })
  const { data: products } = useQuery({ queryKey: queryKeys.products.list({ limit: 48 }), queryFn: () => getProductsBulk() })
  const { data: orders, isPending: ordersPending } = useQuery({
    queryKey: queryKeys.suppliers.orders(status),
    queryFn: () => getSupplierOrdersRequest(status),
  })

  const invalidateOperations = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
    void queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const createSupplier = useMutation({
    mutationFn: createSupplierRequest,
    onSuccess: () => {
      invalidateOperations()
      toast.success("Supplier saved")
    },
    onError: (error) => toastApiError(error),
  })
  const updateSupplier = useMutation({
    mutationFn: ({ supplier, input }: { supplier: Supplier; input: Partial<SupplierInput> }) =>
      updateSupplierRequest(supplier.id, input),
    onSuccess: () => {
      invalidateOperations()
      toast.success("Supplier updated")
    },
    onError: (error) => toastApiError(error),
  })
  const deactivateSupplier = useMutation({
    mutationFn: deactivateSupplierRequest,
    onSuccess: () => {
      invalidateOperations()
      toast.success("Supplier deactivated")
    },
    onError: (error) => toastApiError(error),
  })
  const createOrder = useMutation({
    mutationFn: createSupplierOrderRequest,
    onSuccess: () => {
      invalidateOperations()
      toast.success("Supplier order created")
    },
    onError: (error) => toastApiError(error),
  })
  const receiveOrder = useMutation({
    mutationFn: receiveSupplierOrderRequest,
    onSuccess: () => {
      invalidateOperations()
      toast.success("Stock received")
    },
    onError: (error) => toastApiError(error),
  })
  const cancelOrder = useMutation({
    mutationFn: cancelSupplierOrderRequest,
    onSuccess: () => {
      invalidateOperations()
      toast.success("Supplier order cancelled")
    },
    onError: (error) => toastApiError(error),
  })

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <SupplierForm onSubmit={(input) => createSupplier.mutate(input)} disabled={createSupplier.isPending} />
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Suppliers</h2>
          <div className="divide-y divide-border/60 bg-white ring-1 ring-border/60">
            {suppliers?.map((supplier) => (
              <SupplierRow
                key={supplier.id}
                supplier={supplier}
                onSave={(input) => updateSupplier.mutate({ supplier, input })}
                onDeactivate={() => deactivateSupplier.mutate(supplier.id)}
              />
            ))}
            {!suppliers?.length && <p className="p-4 text-sm text-muted-foreground">No suppliers yet.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <SupplierOrderForm
          suppliers={suppliers?.filter((supplier) => supplier.isActive) ?? []}
          products={products?.data ?? []}
          disabled={createOrder.isPending}
          onSubmit={(input) => createOrder.mutate(input)}
        />
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Supplier orders</h2>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as SupplierOrderStatus | "ALL")}
              className="h-10 bg-white px-3 text-sm ring-1 ring-border/60"
            >
              {ORDER_STATUS.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          {ordersPending ? (
            <p className="text-sm text-muted-foreground">Loading supplier orders...</p>
          ) : orders?.length ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="space-y-4 bg-white p-5 ring-1 ring-border/60">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <h3 className="text-lg font-semibold">{order.supplier.name}</h3>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{order.status.replaceAll("_", " ")}</p>
                    </div>
                    {order.status === "ON_THE_WAY" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => receiveOrder.mutate(order.id)}>
                          Receive
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => cancelOrder.mutate(order.id)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4 border-t border-border/60 pt-2">
                        <span>{item.product.name}</span>
                        <span className="tabular-nums">
                          {item.quantity} x {formatPrice(item.unitCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No supplier orders found.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function SupplierForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (input: SupplierInput) => void }) {
  const [input, setInput] = useState<SupplierInput>({ name: "" })
  const setField = (field: keyof SupplierInput, value: string) => setInput((current) => ({ ...current, [field]: value }))
  return (
    <form
      className="space-y-4 bg-white p-5 ring-1 ring-border/60"
      onSubmit={(event) => {
        event.preventDefault()
        if (!input.name.trim()) return
        onSubmit(input)
        setInput({ name: "" })
      }}
    >
      <h2 className="text-lg font-medium">Add supplier</h2>
      <FieldInput label="Supplier name" value={input.name} onChange={(value) => setField("name", value)} />
      <FieldInput label="Contact person" value={input.contactPerson ?? ""} onChange={(value) => setField("contactPerson", value)} />
      <FieldInput label="Email" value={input.email ?? ""} onChange={(value) => setField("email", value)} />
      <FieldInput label="Phone" value={input.phone ?? ""} onChange={(value) => setField("phone", value)} />
      <FieldInput label="Notes" value={input.notes ?? ""} onChange={(value) => setField("notes", value)} />
      <Button type="submit" disabled={disabled || !input.name.trim()}>
        Save supplier
      </Button>
    </form>
  )
}

function SupplierRow({
  onDeactivate,
  onSave,
  supplier,
}: {
  onDeactivate: () => void
  onSave: (input: Partial<SupplierInput>) => void
  supplier: Supplier
}) {
  const [draft, setDraft] = useState<SupplierInput>({
    name: supplier.name,
    contactPerson: supplier.contactPerson ?? "",
    email: supplier.email ?? "",
    phone: supplier.phone ?? "",
    notes: supplier.notes ?? "",
  })
  const setField = (field: keyof SupplierInput, value: string) => setDraft((current) => ({ ...current, [field]: value }))
  const dirty =
    draft.name !== supplier.name ||
    (draft.contactPerson ?? "") !== (supplier.contactPerson ?? "") ||
    (draft.email ?? "") !== (supplier.email ?? "") ||
    (draft.phone ?? "") !== (supplier.phone ?? "") ||
    (draft.notes ?? "") !== (supplier.notes ?? "")

  return (
    <div className="space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldInput label="Name" value={draft.name} onChange={(value) => setField("name", value)} />
        <FieldInput label="Contact" value={draft.contactPerson ?? ""} onChange={(value) => setField("contactPerson", value)} />
        <FieldInput label="Email" value={draft.email ?? ""} onChange={(value) => setField("email", value)} />
        <FieldInput label="Phone" value={draft.phone ?? ""} onChange={(value) => setField("phone", value)} />
        <div className="sm:col-span-2">
          <FieldInput label="Notes" value={draft.notes ?? ""} onChange={(value) => setField("notes", value)} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{supplier.isActive ? "Active" : "Inactive"}</span>
        <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={!draft.name.trim() || !dirty} onClick={() => onSave(draft)}>
          Update
        </Button>
        {supplier.isActive && (
          <Button size="sm" variant="destructive" onClick={onDeactivate}>
            Deactivate
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}

function SupplierOrderForm({
  disabled,
  onSubmit,
  products,
  suppliers,
}: {
  disabled: boolean
  onSubmit: (input: { supplierId: string; notes?: string; items: Array<{ productId: string; quantity: number; unitCost: number }> }) => void
  products: Array<{ id: string; name: string; cost: string }>
  suppliers: Supplier[]
}) {
  const [supplierId, setSupplierId] = useState("")
  const [lines, setLines] = useState([{ productId: "", quantity: "1", unitCost: "" }])
  const [notes, setNotes] = useState("")
  const readyLines = lines
    .filter((line) => line.productId)
    .map((line) => {
      const product = products.find((candidate) => candidate.id === line.productId)
      return {
        productId: line.productId,
        quantity: Number.parseInt(line.quantity, 10) || 1,
        unitCost: Number.parseFloat(line.unitCost || product?.cost || "0") || 0,
      }
    })

  return (
    <form
      className="space-y-4 bg-white p-5 ring-1 ring-border/60"
      onSubmit={(event) => {
        event.preventDefault()
        if (!supplierId || readyLines.length === 0) return
        onSubmit({
          supplierId,
          notes: notes || undefined,
          items: readyLines,
        })
        setLines([{ productId: "", quantity: "1", unitCost: "" }])
        setNotes("")
      }}
    >
      <h2 className="text-lg font-medium">Create supplier order</h2>
      <FieldSelect label="Supplier" value={supplierId} onChange={setSupplierId} options={suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name }))} />
      <div className="space-y-3">
        {lines.map((line, index) => {
          const selectedProduct = products.find((product) => product.id === line.productId)
          const fallbackCost = line.unitCost || selectedProduct?.cost || "0"
          return (
            <div key={index} className="space-y-3 bg-muted/30 p-3">
              <FieldSelect
                label={`Product ${index + 1}`}
                value={line.productId}
                onChange={(value) =>
                  setLines((current) =>
                    current.map((item, lineIndex) =>
                      lineIndex === index ? { ...item, productId: value, unitCost: "" } : item,
                    ),
                  )
                }
                options={products.map((product) => ({ value: product.id, label: product.name }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label="Quantity"
                  value={line.quantity}
                  onChange={(value) =>
                    setLines((current) =>
                      current.map((item, lineIndex) => (lineIndex === index ? { ...item, quantity: value } : item)),
                    )
                  }
                />
                <FieldInput
                  label="Unit cost"
                  value={fallbackCost}
                  onChange={(value) =>
                    setLines((current) =>
                      current.map((item, lineIndex) => (lineIndex === index ? { ...item, unitCost: value } : item)),
                    )
                  }
                />
              </div>
              {lines.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                >
                  Remove line
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setLines((current) => [...current, { productId: "", quantity: "1", unitCost: "" }])}
      >
        Add product line
      </Button>
      <FieldInput label="Notes" value={notes} onChange={setNotes} />
      <Button type="submit" disabled={disabled || !supplierId || readyLines.length === 0}>
        Create incoming order
      </Button>
    </form>
  )
}

function FieldInput({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function FieldSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  value: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full bg-white px-3 text-sm ring-1 ring-border/60">
        <option value="">Choose {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
