"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { DynamicModal } from "@/components/common/dynamic-modal"
import {
  ProductPicker,
  computeSelectionTotal,
  type ProductPickerSelection,
} from "@/components/admin/suppliers/product-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { createSupplierOrderRequest } from "@/features/suppliers/api"
import { toastApiError } from "@/lib/error-message"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { formatPrice } from "@/lib/format-price"
import { useIsMobile } from "@/lib/use-is-mobile"
import { queryKeys } from "@/lib/query-keys"
import type { Supplier } from "@/lib/types/supplier"
import { cn } from "@/lib/utils"

const supplierAccent = adminPrimaryButtonClass("suppliers")

type SupplierOrderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
}

export function SupplierOrderModal({ open, onOpenChange, suppliers }: SupplierOrderModalProps) {
  const isMobile = useIsMobile()
  const activeSuppliers = suppliers.filter((supplier) => supplier.isActive)

  if (isMobile) {
    return (
      <SupplierOrderMobileSheet
        open={open}
        onOpenChange={onOpenChange}
        suppliers={activeSuppliers}
      />
    )
  }

  return (
    <SupplierOrderDesktopModal
      open={open}
      onOpenChange={onOpenChange}
      suppliers={activeSuppliers}
    />
  )
}

function useSupplierOrderForm(onSuccess: () => void) {
  const queryClient = useQueryClient()
  const [supplierId, setSupplierId] = useState("")
  const [notes, setNotes] = useState("")
  const [selected, setSelected] = useState<ProductPickerSelection>({})

  const reset = () => {
    setSupplierId("")
    setNotes("")
    setSelected({})
  }

  const createMutation = useMutation({
    mutationFn: createSupplierOrderRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
      void queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      toast.success("Supplier order created")
      reset()
      onSuccess()
    },
    onError: (error) => toastApiError(error),
  })

  const lines = Object.values(selected)
  const total = computeSelectionTotal(selected)
  const canSubmit = Boolean(supplierId) && lines.length > 0 && !createMutation.isPending

  const submit = () => {
    if (!canSubmit) return
    createMutation.mutate({
      supplierId,
      notes: notes.trim() || undefined,
      items: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        unitCost: line.unitCost,
      })),
    })
  }

  return {
    supplierId,
    setSupplierId,
    notes,
    setNotes,
    selected,
    setSelected,
    reset,
    createMutation,
    lines,
    total,
    canSubmit,
    submit,
  }
}

function SupplierOrderDesktopModal({
  open,
  onOpenChange,
  suppliers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
}) {
  const form = useSupplierOrderForm(() => onOpenChange(false))

  return (
    <DynamicModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) form.reset()
      }}
      title="Add supplier order"
      compactTitle
      fullscreen
      bodyScroll={false}
    >
      {open ? (
        <div className="grid h-full min-h-0 flex-1 grid-cols-[minmax(0,1fr)_min(36rem,44%)] grid-rows-[minmax(0,1fr)] overflow-hidden">
          <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border/60">
            <div className="shrink-0 border-b border-border/60 px-4 py-3 sm:px-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase">Supplier</Label>
                  <Select value={form.supplierId} onValueChange={form.setSupplierId}>
                    <SelectTrigger className="h-9 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
                      <SelectValue placeholder="Choose supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase">Notes</Label>
                  <Input
                    value={form.notes}
                    onChange={(event) => form.setNotes(event.target.value)}
                    placeholder="Optional"
                    className="h-9 border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-5 sm:py-4">
              <ProductPicker
                selected={form.selected}
                onSelectedChange={form.setSelected}
                className="h-full min-h-0"
                embedded
                enabled={open}
              />
            </div>
          </div>
          <OrderSidebar
            lines={form.lines}
            total={form.total}
            selected={form.selected}
            onSelectedChange={form.setSelected}
            canSubmit={form.canSubmit}
            busy={form.createMutation.isPending}
            onSubmit={form.submit}
          />
        </div>
      ) : null}
    </DynamicModal>
  )
}

function SupplierOrderMobileSheet({
  open,
  onOpenChange,
  suppliers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
}) {
  const [stage, setStage] = useState<1 | 2>(1)
  // Defer mounting the heavy product table until the slide-in animation settles
  // so the transform stays smooth on low-powered mobile devices.
  const [ready, setReady] = useState(false)
  const form = useSupplierOrderForm(() => onOpenChange(false))
  const canGoNext = Boolean(form.supplierId) && form.lines.length > 0

  useEffect(() => {
    if (!open) {
      setReady(false)
      return
    }
    const timer = window.setTimeout(() => setReady(true), 280)
    return () => window.clearTimeout(timer)
  }, [open])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      form.reset()
      setStage(1)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="flex flex-col">
        <header className="relative flex h-11 shrink-0 items-center border-b border-border/60 px-4">
            <SheetTitle className="pr-9 text-sm font-medium normal-case tracking-normal">
              Add supplier order
            </SheetTitle>
            <SheetClose
              className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.8} />
            </SheetClose>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {stage === 1 ? (
              <div className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase">Supplier</Label>
                  <Select value={form.supplierId} onValueChange={form.setSupplierId}>
                    <SelectTrigger className="h-9 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
                      <SelectValue placeholder="Choose supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {ready ? (
                  <ProductPicker
                    selected={form.selected}
                    onSelectedChange={form.setSelected}
                    mobileSheet
                    enabled={open}
                  />
                ) : (
                  <div className="min-h-[58vh] animate-pulse rounded-md bg-muted/40" />
                )}
              </div>
            ) : (
              <div className="p-4">
                <OrderLineEditor
                  selected={form.selected}
                  onSelectedChange={form.setSelected}
                  showNotes
                  notes={form.notes}
                  onNotesChange={form.setNotes}
                />
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-border/60 bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {stage === 1 ? (
              <Button
                type="button"
                className={cn("w-full", supplierAccent)}
                disabled={!canGoNext}
                onClick={() => setStage(2)}
              >
                Next stage
              </Button>
            ) : (
              <div className="space-y-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStage(1)}>
                  Back
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium tabular-nums">{formatPrice(form.total)}</span>
                </div>
                <Button
                  type="button"
                  className={cn("w-full", supplierAccent)}
                  disabled={!form.canSubmit}
                  onClick={form.submit}
                >
                  {form.createMutation.isPending ? "Submitting…" : "Submit order"}
                </Button>
              </div>
            )}
          </footer>
      </SheetContent>
    </Sheet>
  )
}

function OrderSidebar({
  lines,
  total,
  selected,
  onSelectedChange,
  canSubmit,
  busy,
  onSubmit,
}: {
  lines: ProductPickerSelection[string][]
  total: number
  selected: ProductPickerSelection
  onSelectedChange: (next: ProductPickerSelection) => void
  canSubmit: boolean
  busy: boolean
  onSubmit: () => void
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Selected ({lines.length})
        </p>
        <Button
          type="button"
          size="sm"
          className={cn("shrink-0", supplierAccent)}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {busy ? "Submitting…" : "Submit order"}
        </Button>
      </div>
      {lines.length > 0 ? (
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-2 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium tabular-nums">{formatPrice(total)}</span>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Select products from the table.</p>
        ) : (
          <OrderLineEditor selected={selected} onSelectedChange={onSelectedChange} compact />
        )}
      </div>
    </aside>
  )
}

function OrderLineEditor({
  selected,
  onSelectedChange,
  compact,
  showNotes,
  notes,
  onNotesChange,
}: {
  selected: ProductPickerSelection
  onSelectedChange: (next: ProductPickerSelection) => void
  compact?: boolean
  showNotes?: boolean
  notes?: string
  onNotesChange?: (value: string) => void
}) {
  const lines = Object.values(selected)

  const updateLine = (
    productId: string,
    patch: Partial<{ quantity: number; unitCost: number }>,
  ) => {
    const line = selected[productId]
    if (!line) return
    onSelectedChange({
      ...selected,
      [productId]: { ...line, ...patch },
    })
  }

  const removeLine = (productId: string) => {
    const next = { ...selected }
    delete next[productId]
    onSelectedChange(next)
  }

  return (
    <div className="space-y-4">
      {showNotes && onNotesChange ? (
        <div className="space-y-2">
          <Label className="text-xs uppercase">Notes</Label>
          <Input
            value={notes ?? ""}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Optional"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
      ) : null}
      <ul className={cn("space-y-3", compact && "space-y-4")}>
        {lines.map((line) => {
          const lineTotal = line.quantity * line.unitCost
          return (
            <li
              key={line.product.id}
              className="space-y-2 border-b border-border/60 pb-3 last:border-0"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-medium leading-snug">{line.product.name}</p>
                <button
                  type="button"
                  className="shrink-0 text-xs text-muted-foreground underline"
                  onClick={() => removeLine(line.product.id)}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Qty
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) => {
                      const quantity = Math.max(1, Number.parseInt(event.target.value, 10) || 1)
                      updateLine(line.product.id, { quantity })
                    }}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Unit cost
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitCost}
                    onChange={(event) => {
                      const unitCost = Math.max(0, Number.parseFloat(event.target.value) || 0)
                      updateLine(line.product.id, { unitCost })
                    }}
                    className="h-9"
                  />
                </div>
              </div>
              <p className="text-right text-xs tabular-nums text-muted-foreground">
                Line total: {formatPrice(lineTotal)}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
