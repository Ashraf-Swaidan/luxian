"use client"

import { AiSearchIcon, FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { StoreImage } from "@/components/common/store-image"
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
import { getCollections } from "@/features/collections/api"
import { getProducts } from "@/features/products/api"
import type { ProductListParams } from "@/features/products/types"
import { getErrorMessage, toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"

const PAGE_SIZE = 12
const ALL_CATEGORIES = "all"

export function ProductsCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoryId = searchParams.get("categoryId") ?? undefined
  const collectionId = searchParams.get("collectionId") ?? undefined
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const searchFromUrl = searchParams.get("search") ?? ""
  const minPrice = searchParams.get("minPrice") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const minStock = searchParams.get("minStock") ?? ""
  const maxStock = searchParams.get("maxStock") ?? ""
  const [showFilters, setShowFilters] = useState(hasExtendedFilters(searchParams))

  const listParams: ProductListParams = useMemo(
    () => ({
      search: searchFromUrl.trim() || undefined,
      categoryId,
      collectionId,
      page,
      limit: PAGE_SIZE,
      minPrice: toNumber(minPrice),
      maxPrice: toNumber(maxPrice),
      minStock: toNumber(minStock),
      maxStock: toNumber(maxStock),
    }),
    [categoryId, collectionId, maxPrice, maxStock, minPrice, minStock, page, searchFromUrl],
  )

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const { data: collections } = useQuery({
    queryKey: queryKeys.collections.all,
    queryFn: getCollections,
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
  const selectedCollection = collections?.find((collection) => collection.id === collectionId)

  return (
    <div className="space-y-8">
      {selectedCollection && <CollectionHero collection={selectedCollection} />}

      <section className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_14rem_auto] lg:items-end">
          <div className="space-y-2">
            <Label
              htmlFor="product-search"
              className="flex items-center gap-2 text-xs uppercase"
            >
              <HugeiconsIcon icon={AiSearchIcon} className="size-4" strokeWidth={1.8} />
              Search products
            </Label>
            <Input
              id="product-search"
              type="search"
              placeholder="Type a product name"
              value={searchFromUrl}
              onChange={(event) =>
                updateParams({
                  search: event.target.value || null,
                  page: "1",
                })
              }
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category" className="text-xs uppercase">
              Category
            </Label>
            <Select
              value={categoryId ?? ALL_CATEGORIES}
              onValueChange={(value) =>
                updateParams({
                  categoryId: value === ALL_CATEGORIES ? null : value,
                  page: "1",
                })
              }
            >
              <SelectTrigger
                id="product-category"
                className="h-9 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
              >
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-collection" className="text-xs uppercase">
              Collection
            </Label>
            <Select
              value={collectionId ?? ALL_CATEGORIES}
              onValueChange={(value) =>
                updateParams({
                  collectionId: value === ALL_CATEGORIES ? null : value,
                  page: "1",
                })
              }
            >
              <SelectTrigger
                id="product-collection"
                className="h-9 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
              >
                <SelectValue placeholder="All collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All collections</SelectItem>
                {collections?.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="flex size-10 items-center justify-center bg-neutral-950 text-white"
            title="More filters"
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-4 bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberFilter
              label="Lowest price"
              value={minPrice}
              onChange={(value) => updateParams({ minPrice: value || null, page: "1" })}
            />
            <NumberFilter
              label="Highest price"
              value={maxPrice}
              onChange={(value) => updateParams({ maxPrice: value || null, page: "1" })}
            />
            <NumberFilter
              label="Minimum stock"
              value={minStock}
              onChange={(value) => updateParams({ minStock: value || null, page: "1" })}
            />
            <NumberFilter
              label="Maximum stock"
              value={maxStock}
              onChange={(value) => updateParams({ maxStock: value || null, page: "1" })}
            />
          </div>
        )}

        {meta && (
          <p className="text-sm text-muted-foreground">
            {meta.total === 0
              ? "No products match your filters"
              : `Showing ${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}`}
            {isFetching && !isPending ? " · Updating..." : ""}
          </p>
        )}
      </section>

      {isPending && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
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
          <div className={isFetching && !isPending ? "opacity-70 transition-opacity" : undefined}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          {meta && (
            <ProductsPagination
              meta={meta}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
          )}
        </>
      )}
    </div>
  )
}

function NumberFilter({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
      />
    </div>
  )
}

function CollectionHero({ collection }: { collection: Collection }) {
  return (
    <section className="grid min-h-72 overflow-hidden bg-neutral-950 text-white md:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col justify-end p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-white/60">
          Collection
        </p>
        <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-none sm:text-7xl">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            {collection.description}
          </p>
        )}
      </div>
      <div className="relative min-h-64 bg-muted">
        {collection.imageUrl ? (
          <StoreImage
            src={collection.imageUrl}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Luxian
          </div>
        )}
      </div>
    </section>
  )
}

function hasExtendedFilters(searchParams: URLSearchParams) {
  return ["minPrice", "maxPrice", "minStock", "maxStock"].some((key) =>
    searchParams.has(key),
  )
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined
}
