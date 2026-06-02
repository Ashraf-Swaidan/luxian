"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSearchIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  cancelSupplierOrderRequest,
  getSupplierOrdersRequest,
  receiveSupplierOrderRequest,
} from "@/features/suppliers/api"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import type { SupplierOrder, SupplierOrderStatus } from "@/lib/types/supplier"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 6
const statuses: SupplierOrderStatus[] = ["ON_THE_WAY", "RECEIVED", "CANCELLED"]
const supplierAccent = adminPrimaryButtonClass("suppliers")

const statusLabels: Record<SupplierOrderStatus, string> = {
  ON_THE_WAY: "On the way",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
}

export function SupplierOrdersView() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<SupplierOrderStatus>("ON_THE_WAY")
  const [page, setPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [confirmation, setConfirmation] = useState<{
    action: "receive" | "cancel"
    order: SupplierOrder
  } | null>(null)
  const debouncedSearch = useDebouncedValue(search, 250)

  const { data: orders, isPending } = useQuery({
    queryKey: queryKeys.suppliers.orders("ALL"),
    queryFn: () => getSupplierOrdersRequest("ALL"),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const receiveMutation = useMutation({
    mutationFn: receiveSupplierOrderRequest,
    onSuccess: () => {
      invalidate()
      toast.success("Supplier order received")
      setConfirmation(null)
    },
    onError: (error) => toastApiError(error),
  })

  const cancelMutation = useMutation({
    mutationFn: cancelSupplierOrderRequest,
    onSuccess: () => {
      invalidate()
      toast.success("Supplier order cancelled")
      setConfirmation(null)
    },
    onError: (error) => toastApiError(error),
  })

  const filteredOrders = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    const list = [...(orders ?? [])]
      .filter((order) => order.status === status)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )

    if (!term) return list

    return list.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.supplier.name,
        order.notes,
        ...order.items.map((item) => item.product.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [orders, debouncedSearch, status])

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE)))
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const pageItems = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const setExpanded = (orderId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const executeConfirmation = () => {
    if (!confirmation) return
    if (confirmation.action === "receive") receiveMutation.mutate(confirmation.order.id)
    else cancelMutation.mutate(confirmation.order.id)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="supplier-order-search" className="flex items-center gap-2 text-xs uppercase">
            <HugeiconsIcon icon={AiSearchIcon} className="size-4" strokeWidth={1.8} />
            Search supplier orders
          </Label>
          <Input
            id="supplier-order-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Order, supplier, product, or notes"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier-order-status" className="text-xs uppercase">
            Status
          </Label>
          <div className="relative">
            <span
              className={cn(
                "pointer-events-none absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full",
                getStatusDotClass(status),
              )}
            />
            <select
              id="supplier-order-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as SupplierOrderStatus)
                setPage(1)
              }}
              className="h-10 w-full border-x-0 border-t-0 border-b border-border/80 bg-transparent pl-4 text-sm outline-none"
            >
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {statusLabels[option]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        {isPending ? (
          <OrdersSkeleton />
        ) : (
          <div className="divide-y divide-border/60 md:divide-y-0 md:space-y-3">
            {pageItems.length ? (
              pageItems.map((order) => (
                <SupplierOrderCard
                  key={order.id}
                  order={order}
                  expanded={expandedIds.has(order.id)}
                  onToggleExpanded={() => setExpanded(order.id)}
                  onConfirm={setConfirmation}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders found.</p>
            )}
          </div>
        )}

        {!isPending && filteredOrders.length > PAGE_SIZE ? (
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        ) : null}
      </section>

      <ConfirmOrderActionDialog
        confirmation={confirmation}
        busy={receiveMutation.isPending || cancelMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null)
        }}
        onConfirm={executeConfirmation}
      />
    </div>
  )
}

function SupplierOrderCard({
  expanded,
  onConfirm,
  onToggleExpanded,
  order,
}: {
  expanded: boolean
  onConfirm: (confirmation: { action: "receive" | "cancel"; order: SupplierOrder }) => void
  onToggleExpanded: () => void
  order: SupplierOrder
}) {
  const total = getOrderTotal(order)
  const itemCount = getItemCount(order)

  return (
    <article className="px-0 py-3 transition-colors md:bg-white md:p-4 md:ring-1 md:ring-border/60">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-base font-semibold leading-tight">{order.supplier.name}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", getStatusBadgeClass(order.status))}>
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(order.createdAt)} · {order.orderNumber} · {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums">{formatPrice(String(total))}</p>
            <p className="text-[11px] text-muted-foreground">total</p>
          </div>
          <span className="flex size-8 items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={expanded ? ArrowUp01Icon : ArrowDown01Icon} className="size-4" strokeWidth={1.8} />
          </span>
        </div>
      </button>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[3rem_minmax(0,1fr)_auto] gap-3 text-sm md:grid-cols-[3.5rem_minmax(0,1fr)_4rem_7rem_7rem] md:items-center"
              >
                <div className="relative size-12 overflow-hidden bg-muted md:size-14">
                  {item.product.imageUrl ? (
                    <StoreImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] uppercase text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 self-center">
                  <p className="truncate font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                </div>
                <div className="self-center text-right text-xs tabular-nums md:hidden">
                  <p>{item.quantity} x {formatPrice(item.unitCost)}</p>
                  <p className="font-medium text-foreground">{formatPrice(String(getLineTotal(item)))}</p>
                </div>
                <span className="hidden text-right tabular-nums text-muted-foreground md:block">{item.quantity}</span>
                <span className="hidden text-right tabular-nums text-muted-foreground md:block">{formatPrice(item.unitCost)}</span>
                <span className="hidden text-right font-medium tabular-nums md:block">{formatPrice(String(getLineTotal(item)))}</span>
              </div>
            ))}
          </div>

          {order.notes ? (
            <p className="bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">{order.notes}</p>
          ) : null}

          {order.receivedAt || order.cancelledAt ? (
            <p className="text-xs text-muted-foreground">
              {order.receivedAt ? `Received ${formatDate(order.receivedAt)}` : null}
              {order.cancelledAt ? `Cancelled ${formatDate(order.cancelledAt)}` : null}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm font-medium">Order total</span>
            <span className="text-sm font-semibold tabular-nums">{formatPrice(String(total))}</span>
          </div>

          {order.status === "ON_THE_WAY" ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" size="sm" className={cn(supplierAccent)} onClick={() => onConfirm({ action: "receive", order })}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={1.8} />
                Receive
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => onConfirm({ action: "cancel", order })}>
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.8} />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function ConfirmOrderActionDialog({
  busy,
  confirmation,
  onConfirm,
  onOpenChange,
}: {
  busy: boolean
  confirmation: { action: "receive" | "cancel"; order: SupplierOrder } | null
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) {
  const receiving = confirmation?.action === "receive"

  return (
    <Dialog open={Boolean(confirmation)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl normal-case tracking-normal">
              {receiving ? "Receive supplier order?" : "Cancel supplier order?"}
            </DialogTitle>
            <DialogDescription>
              {receiving
                ? "This will add the ordered quantities to sellable stock and update current product costs."
                : "This will close the incoming supplier order without changing product stock."}
            </DialogDescription>
          </DialogHeader>
          {confirmation ? (
            <div className="mt-4 bg-muted/30 p-3 text-sm">
              <p className="font-medium">{confirmation.order.supplier.name}</p>
              <p className="text-muted-foreground">
                {confirmation.order.orderNumber} · {formatDate(confirmation.order.createdAt)}
              </p>
            </div>
          ) : null}
        </div>
        <DialogFooter className="border-t border-border/60 px-5 py-4 sm:px-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={busy}>
              Keep order
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={receiving ? "default" : "destructive"}
            className={receiving ? cn(supplierAccent) : undefined}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working..." : receiving ? "Receive order" : "Cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaginationControls({
  onPageChange,
  page,
  totalPages,
}: {
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        Previous
      </Button>
      <span className="tabular-nums text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
        Next
      </Button>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  )
}

function getItemCount(order: SupplierOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function getLineTotal(item: SupplierOrder["items"][number]) {
  return Number(item.unitCost) * item.quantity
}

function getOrderTotal(order: SupplierOrder) {
  return order.items.reduce((sum, item) => sum + getLineTotal(item), 0)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function getStatusDotClass(status: SupplierOrderStatus) {
  if (status === "ON_THE_WAY") return "bg-[oklch(0.84_0.12_160)]"
  if (status === "RECEIVED") return "bg-neutral-950"
  return "bg-destructive"
}

function getStatusBadgeClass(status: SupplierOrderStatus) {
  if (status === "ON_THE_WAY") return "bg-[oklch(0.84_0.12_160)] text-neutral-950"
  if (status === "RECEIVED") return "bg-neutral-950 text-white"
  return "bg-destructive/10 text-destructive"
}
