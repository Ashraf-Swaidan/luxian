"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSearchIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { SupplierFormModal } from "@/components/admin/suppliers/supplier-form-modal"
import { SupplierOrderModal } from "@/components/admin/suppliers/supplier-order-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createSupplierRequest,
  deactivateSupplierRequest,
  getSuppliersRequest,
  updateSupplierRequest,
} from "@/features/suppliers/api"
import type { SupplierInput } from "@/features/suppliers/api"
import { toastApiError } from "@/lib/error-message"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import { useIsMobile } from "@/lib/use-is-mobile"
import { adminPrimaryButtonClass } from "@/lib/admin-section-colors"
import { queryKeys } from "@/lib/query-keys"
import type { Supplier } from "@/lib/types/supplier"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const supplierAccent = adminPrimaryButtonClass("suppliers")

export function SuppliersHome() {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)

  const [createOpen, setCreateOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  const { data: suppliers, isPending } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: getSuppliersRequest,
  })

  const filtered = useMemo(() => {
    const list = suppliers ?? []
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return list
    return list.filter((supplier) => {
      const haystack = [
        supplier.name,
        supplier.contactPerson,
        supplier.email,
        supplier.phone,
        supplier.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [suppliers, debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
    void queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const createMutation = useMutation({
    mutationFn: createSupplierRequest,
    onSuccess: () => {
      invalidate()
      toast.success("Supplier created")
      setCreateOpen(false)
    },
    onError: (error) => toastApiError(error),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SupplierInput> }) =>
      updateSupplierRequest(id, input),
    onSuccess: () => {
      invalidate()
      toast.success("Supplier updated")
      setEditSupplier(null)
    },
    onError: (error) => toastApiError(error),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateSupplierRequest,
    onSuccess: () => {
      invalidate()
      toast.success("Supplier deactivated")
      setEditSupplier(null)
    },
    onError: (error) => toastApiError(error),
  })

  const busy =
    createMutation.isPending || updateMutation.isPending || deactivateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="supplier-search" className="flex items-center gap-2 text-xs uppercase">
            <HugeiconsIcon icon={AiSearchIcon} className="size-4" strokeWidth={1.8} />
            Search suppliers
          </Label>
          <Input
            id="supplier-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Name, contact, email, or phone"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
            Add supplier
          </Button>
          <Button
            type="button"
            className={cn(supplierAccent)}
            onClick={() => setOrderOpen(true)}
          >
            Add order
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isMobile ? (
        <SuppliersMobileList
          suppliers={pageItems}
          onEdit={setEditSupplier}
          empty={filtered.length === 0}
        />
      ) : (
        <div className="bg-white ring-1 ring-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                      {!supplier.isActive ? (
                        <span className="ml-2 text-xs uppercase text-muted-foreground">
                          Inactive
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.contactPerson ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{supplier.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{supplier.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditSupplier(supplier)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filtered.length} supplier{filtered.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <SupplierFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        busy={busy}
        onSubmit={(input) => createMutation.mutate(input)}
      />

      <SupplierFormModal
        open={Boolean(editSupplier)}
        onOpenChange={(open) => {
          if (!open) setEditSupplier(null)
        }}
        supplier={editSupplier}
        busy={busy}
        onSubmit={(input) => {
          if (!editSupplier) return
          updateMutation.mutate({ id: editSupplier.id, input })
        }}
        onDeactivate={() => {
          if (!editSupplier) return
          deactivateMutation.mutate(editSupplier.id)
        }}
      />

      <SupplierOrderModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        suppliers={suppliers ?? []}
      />
    </div>
  )
}

function SuppliersMobileList({
  suppliers,
  onEdit,
  empty,
}: {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  empty: boolean
}) {
  if (empty) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No suppliers found.</p>
  }

  return (
    <div className="divide-y divide-border/60">
      {suppliers.map((supplier) => (
        <SupplierMobileCard key={supplier.id} supplier={supplier} onEdit={() => onEdit(supplier)} />
      ))}
    </div>
  )
}

function SupplierMobileCard({
  supplier,
  onEdit,
}: {
  supplier: Supplier
  onEdit: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">
            {supplier.name}
            {!supplier.isActive ? (
              <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">Inactive</span>
            ) : null}
          </p>
          {supplier.contactPerson ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{supplier.contactPerson}</p>
          ) : null}
          {supplier.phone ? (
            <p className="text-xs text-muted-foreground">{supplier.phone}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onEdit}>
            <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" strokeWidth={1.8} />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setExpanded((value) => !value)}
          >
            <HugeiconsIcon
              icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
              className="size-4"
              strokeWidth={1.8}
            />
            <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
          </Button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-2 space-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
          {supplier.email ? <p>{supplier.email}</p> : <p className="italic">No email</p>}
          {supplier.notes ? <p className="pt-1 text-foreground/80">{supplier.notes}</p> : null}
        </div>
      ) : null}
    </article>
  )
}
