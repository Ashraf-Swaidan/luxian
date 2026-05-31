"use client"

import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { ProductCard } from "@/components/products/product-card"
import { ProductsPagination } from "@/components/products/products-pagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories } from "@/features/categories/api"
import { getProducts } from "@/features/products/api"
import type { ProductListParams } from "@/features/products/types"
import { getErrorMessage, toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import { useDebouncedValue } from "@/lib/use-debounced-value"

const PAGE_SIZE = 12

export function ProductsCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoryId = searchParams.get("categoryId") ?? undefined
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const searchFromUrl = searchParams.get("search") ?? ""

  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const debouncedSearch = useDebouncedValue(searchInput, 350)

  // Keep the input in sync when user navigates back/forward
  useEffect(() => {
    setSearchInput(searchFromUrl)
  }, [searchFromUrl])

  // Push debounced search to the URL (reset to page 1 when search changes)
  useEffect(() => {
    const trimmed = debouncedSearch.trim()
    if (trimmed === searchFromUrl.trim()) {
      return
    }
    updateParams({ search: trimmed || null, page: "1" })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to debounced value
  }, [debouncedSearch])

  const listParams: ProductListParams = useMemo(
    () => ({
      search: searchFromUrl.trim() || undefined,
      categoryId,
      page,
      limit: PAGE_SIZE,
    }),
    [searchFromUrl, categoryId, page],
  )

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: queryKeys.products.list(listParams),
    queryFn: () => getProducts(listParams),
    placeholderData: (previous) => previous,
  })

  useEffect(() => {
    if (isError) {
      toastApiError(error, "Failed to load products")
    }
  }, [isError, error])

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const products = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-md border border-border/60 bg-card p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <div className="space-y-2">
            <Label htmlFor="product-search">Search</Label>
            <Input
              id="product-search"
              type="search"
              placeholder="Name, description, or SKU…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select
              value={categoryId ?? "all"}
              onValueChange={(value) =>
                updateParams({
                  categoryId: value === "all" ? null : value,
                  page: "1",
                })
              }
            >
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {meta && (
          <p className="text-sm text-muted-foreground">
            {meta.total === 0
              ? "No products match your filters"
              : `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
            {isFetching && !isPending ? " · Updating…" : ""}
          </p>
        )}
      </div>

      {isPending && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-md" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load products")}
        </p>
      )}

      {!isPending && !isError && products.length === 0 && (
        <EmptyState
          title="No products found"
          description="Try a different search or category."
          actionLabel="Clear filters"
          actionHref="/products"
        />
      )}

      {!isPending && !isError && products.length > 0 && (
        <>
          <div
            className={
              isFetching && !isPending ? "opacity-70 transition-opacity" : undefined
            }
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          {meta && (
            <ProductsPagination
              meta={meta}
              onPageChange={(nextPage) =>
                updateParams({ page: String(nextPage) })
              }
            />
          )}
        </>
      )}
    </div>
  )
}
