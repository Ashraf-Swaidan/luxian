"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiSearchIcon, FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { useQuery } from "@tanstack/react-query"

import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCategories } from "@/features/categories/api"
import { getCollectionsForAdmin } from "@/features/collections/api"
import { getProducts } from "@/features/products/api"
import type { ProductListParams } from "@/features/products/types"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 12
const ALL_FILTER = "all"

export type ProductPickerSelection = Record<
  string,
  { product: Product; quantity: number; unitCost: number }
>

type ProductPickerProps = {
  selected: ProductPickerSelection
  onSelectedChange: (next: ProductPickerSelection) => void
  className?: string
  /** Constrain scrollable table area height inside modals. */
  tableMaxHeightClassName?: string
  /** Fill parent flex column; table scrolls internally. */
  embedded?: boolean
  /** Mobile sheet: tall table in scroll parent; filters expand layout. */
  mobileSheet?: boolean
  /** Gate data fetching until modal is open. */
  enabled?: boolean
}

export function ProductPicker({
  selected,
  onSelectedChange,
  className,
  tableMaxHeightClassName = "max-h-[min(50vh,28rem)]",
  embedded = false,
  mobileSheet = false,
  enabled = true,
}: ProductPickerProps) {
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [collectionId, setCollectionId] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)

  const listParams = useMemo<ProductListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      categoryId: categoryId || undefined,
      collectionId: collectionId || undefined,
    }),
    [categoryId, collectionId, debouncedSearch, page],
  )

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    enabled,
  })

  const { data: collections } = useQuery({
    queryKey: queryKeys.collections.admin,
    queryFn: getCollectionsForAdmin,
    enabled,
  })

  const { data, isPending, isFetching } = useQuery({
    queryKey: queryKeys.products.list(listParams),
    queryFn: () => getProducts(listParams),
    placeholderData: (previous) => previous,
    enabled,
  })

  const products = data?.data ?? []
  const meta = data?.meta
  const selectedIds = new Set(Object.keys(selected))

  const toggleProduct = (product: Product) => {
    if (selectedIds.has(product.id)) {
      const next = { ...selected }
      delete next[product.id]
      onSelectedChange(next)
      return
    }
    const unitCost = Number.parseFloat(product.cost) || 0
    onSelectedChange({
      ...selected,
      [product.id]: { product, quantity: 1, unitCost },
    })
  }

  const togglePage = () => {
    const pageIds = products.map((product) => product.id)
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))
    if (allSelected) {
      const next = { ...selected }
      for (const id of pageIds) delete next[id]
      onSelectedChange(next)
      return
    }
    const next = { ...selected }
    for (const product of products) {
      if (!next[product.id]) {
        const unitCost = Number.parseFloat(product.cost) || 0
        next[product.id] = { product, quantity: 1, unitCost }
      }
    }
    onSelectedChange(next)
  }

  const resetFilters = () => {
    setSearch("")
    setCategoryId("")
    setCollectionId("")
    setPage(1)
  }

  const pageAllSelected =
    products.length > 0 && products.every((product) => selectedIds.has(product.id))

  const tableScrollClass = embedded
    ? "min-h-0 flex-1 overflow-y-auto ring-1 ring-border/60"
    : mobileSheet
      ? "min-h-[58vh] ring-1 ring-border/60"
      : cn("min-h-0 overflow-y-auto ring-1 ring-border/60", tableMaxHeightClassName)

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        embedded && "h-full min-h-0",
        mobileSheet && "min-h-0",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="picker-search" className="flex items-center gap-2 text-xs uppercase">
              <HugeiconsIcon icon={AiSearchIcon} className="size-4" strokeWidth={1.8} />
              Search products
            </Label>
            <Input
              id="picker-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Name or SKU"
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-pressed={showFilters}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            onClick={() => setShowFilters((value) => !value)}
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} className="size-4" strokeWidth={1.8} />
          </Button>
        </div>
        {showFilters ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase">Category</Label>
              <Select
                value={categoryId || ALL_FILTER}
                onValueChange={(value) => {
                  setCategoryId(value === ALL_FILTER ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>All categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Collection</Label>
              <Select
                value={collectionId || ALL_FILTER}
                onValueChange={(value) => {
                  setCollectionId(value === ALL_FILTER ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
                  <SelectValue placeholder="All collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>All collections</SelectItem>
                  {collections?.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>

      <div className={tableScrollClass}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all on page"
                  checked={pageAllSelected}
                  onChange={togglePage}
                  className="size-4 accent-foreground"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="hidden text-right md:table-cell">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No products match your filters.{" "}
                  <button type="button" className="underline" onClick={resetFilters}>
                    Clear filters
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isSelected = selectedIds.has(product.id)
                return (
                  <TableRow
                    key={product.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => toggleProduct(product)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(product)}
                        className="size-4 accent-foreground"
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden bg-muted">
                          {product.imageUrl ? (
                            <StoreImage
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground sm:hidden">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(product.cost)}</TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">
                      {product.stock}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          {selectedIds.size} selected
          {isFetching && !isPending ? " · Updating…" : ""}
        </span>
        {meta ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function computeSelectionTotal(selected: ProductPickerSelection) {
  return Object.values(selected).reduce(
    (sum, line) => sum + line.quantity * line.unitCost,
    0,
  )
}
