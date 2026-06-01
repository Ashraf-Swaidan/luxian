"use client"

import {
  AiSearchIcon,
  ArrowDown02Icon,
  CatalogueIcon,
  FilterHorizontalIcon,
  ShapeCollectionIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { StoreImage } from "@/components/common/store-image"
import { ProductCard } from "@/components/products/product-card"
import { ProductsPagination } from "@/components/products/products-pagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories } from "@/features/categories/api"
import { getCollections } from "@/features/collections/api"
import { trackVisitorEvent } from "@/features/personalization/api"
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
    [categoryId, collectionId, maxPrice, maxStock, minPrice, minStock, page, searchFromUrl]
  )

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const { data: collections } = useQuery({
    queryKey: queryKeys.collections.all,
    queryFn: getCollections,
  })

  const personalize = !collectionId

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: queryKeys.products.list({ ...listParams, personalize }),
    queryFn: () => getProducts(listParams, { personalize }),
    placeholderData: (previous) => previous,
  })

  useEffect(() => {
    if (isError) {
      toastApiError(error, "Failed to load products")
    }
  }, [isError, error])

  useEffect(() => {
    const term = searchFromUrl.trim()
    if (!term) {
      return
    }
    const timer = window.setTimeout(() => {
      trackVisitorEvent({ eventType: "SEARCH", search: term })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [searchFromUrl])

  useEffect(() => {
    if (!categoryId) {
      return
    }
    trackVisitorEvent({ eventType: "CATEGORY_FILTER", categoryId })
  }, [categoryId])

  useEffect(() => {
    if (!collectionId) {
      return
    }
    trackVisitorEvent({ eventType: "COLLECTION_FILTER", collectionId })
  }, [collectionId])

  const handleProductClick = (productId: string) => {
    trackVisitorEvent({ eventType: "PRODUCT_CLICK", productId })
  }

  function updateParams(updates: Record<string, string | null>, options?: { scrollToProducts?: boolean }) {
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
    if (options?.scrollToProducts) {
      window.requestAnimationFrame(() => {
        document.getElementById("collection-products")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      })
    }
  }

  const products = data?.data ?? []
  const meta = data?.meta
  const selectedCollection = collections?.find((collection) => collection.id === collectionId)
  const collectionProductCount = selectedCollection?.collectionProducts?.length ?? meta?.total ?? 0

  return (
    <div className="space-y-8">
      {selectedCollection && <CollectionHero collection={selectedCollection} productCount={collectionProductCount} />}

      <section id="collection-products" className={selectedCollection ? "space-y-6 pt-2" : "space-y-6"}>
        <div className="flex items-end gap-2 md:hidden">
          <div className="min-w-0 flex-1">
            <Label htmlFor="product-search-mobile" className="sr-only">
              Search products
            </Label>
            <Input
              id="product-search-mobile"
              type="search"
              placeholder="Search"
              value={searchFromUrl}
              onChange={(event) =>
                updateParams({
                  search: event.target.value || null,
                  page: "1",
                })
              }
              className="h-10 border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>

          <MobileFilterPopover
            active={Boolean(categoryId)}
            icon={CatalogueIcon}
            label="Category"
            options={[
              { label: "All categories", value: ALL_CATEGORIES },
              ...(categories?.map((category) => ({
                label: category.name,
                value: category.id,
              })) ?? []),
            ]}
            value={categoryId ?? ALL_CATEGORIES}
            onChange={(value) =>
              updateParams({
                categoryId: value === ALL_CATEGORIES ? null : value,
                page: "1",
              })
            }
          />

          <MobileFilterPopover
            active={Boolean(collectionId)}
            icon={ShapeCollectionIcon}
            label="Collection"
            options={[
              { label: "All collections", value: ALL_CATEGORIES },
              ...(collections?.map((collection) => ({
                label: collection.name,
                value: collection.id,
              })) ?? []),
            ]}
            value={collectionId ?? ALL_CATEGORIES}
            onChange={(value) =>
              updateParams({
                collectionId: value === ALL_CATEGORIES ? null : value,
                page: "1",
              })
            }
          />

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="flex size-10 shrink-0 items-center justify-center bg-neutral-950 text-white data-[active=true]:bg-[var(--luxian-teal)] data-[active=true]:text-neutral-950"
            data-active={showFilters}
            title="More filters"
          >
            <HugeiconsIcon icon={FilterHorizontalIcon} className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="hidden gap-4 md:grid lg:grid-cols-[minmax(0,1fr)_14rem_14rem_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="product-search" className="flex items-center gap-2 text-xs uppercase">
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">{getErrorMessage(error, "Failed to load products")}</p>}

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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
              ))}
            </div>
          </div>
          {meta && (
            <ProductsPagination
              meta={meta}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, { scrollToProducts: true })}
            />
          )}
        </>
      )}
    </div>
  )
}

function NumberFilter({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
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

function MobileFilterPopover({
  active,
  icon,
  label,
  onChange,
  options,
  value,
}: {
  active: boolean
  icon: IconSvgElement
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center bg-neutral-100 text-neutral-950 data-[active=true]:bg-neutral-950 data-[active=true]:text-white"
          data-active={active}
          title={label}
        >
          <HugeiconsIcon icon={icon} className="size-5" strokeWidth={1.8} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-2 p-2">
        <p className="px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-2 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.value === value && <span className="size-2 bg-neutral-950" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CollectionHero({ collection, productCount }: { collection: Collection; productCount: number }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#f3efe2]">
      <div className="grid min-h-[34rem] lg:grid-cols-[minmax(18rem,0.72fr)_minmax(30rem,1.28fr)]">
        <div className="relative flex min-h-[24rem] flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10">
          <p className="pointer-events-none absolute top-10 -left-3 z-0 max-w-[105%] truncate font-display text-[3rem] leading-none font-black text-white/80 uppercase sm:text-[4.5rem] lg:top-8 lg:-left-5 lg:text-[5.5rem] xl:text-[6.25rem]">
            {collection.name}
          </p>

          <div className="relative z-10 flex items-center justify-between gap-4 text-xs font-medium tracking-wide text-neutral-600 uppercase">
            <span>Luxian Collection</span>
            <span>{productCount} pieces</span>
          </div>

          <div className="relative z-10 max-w-xl pt-20 sm:pt-28 lg:pt-32">
            <h2 className="max-w-full font-display text-3xl leading-[0.95] font-black break-words text-neutral-950 uppercase sm:text-4xl lg:text-5xl">
              {collection.name}
            </h2>
            {collection.description && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-700 sm:text-base">
                {collection.description}
              </p>
            )}
          </div>

          <div className="relative z-10 mt-8">
            <a
              href="#collection-products"
              className="inline-flex h-11 items-center gap-3 bg-neutral-950 px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Shop
              <HugeiconsIcon icon={ArrowDown02Icon} className="size-4" strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="relative min-h-[30rem] overflow-hidden bg-[#ded6bf] lg:min-h-full">
          {collection.imageUrl ? (
            <StoreImage
              src={collection.imageUrl}
              alt={collection.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 34rem"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="absolute -right-16 bottom-8 h-72 w-72 bg-white/50" />
              <div className="absolute top-12 right-16 h-32 w-32 bg-[var(--luxian-teal)]/45" />
              <div className="absolute bottom-24 left-10 h-24 w-24 bg-[var(--luxian-coral)]/45" />
              <div className="relative z-10 space-y-3">
                <p className="text-xs font-medium tracking-wide text-neutral-600 uppercase">Image coming soon</p>
                <p className="font-display text-5xl leading-none font-black text-neutral-950 uppercase sm:text-6xl">
                  {collection.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {collection.collectionProducts?.length ? (
        <div className="grid border-t border-neutral-950/10 bg-white sm:grid-cols-3">
          {collection.collectionProducts.slice(0, 3).map(({ product, position }) => (
            <div key={product.id} className="flex items-center gap-4 border-neutral-950/10 p-4 sm:border-r">
              <span className="font-display text-3xl font-black text-neutral-950 tabular-nums">
                {String(position + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">Featured piece</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function hasExtendedFilters(searchParams: URLSearchParams) {
  return ["minPrice", "maxPrice", "minStock", "maxStock"].some((key) => searchParams.has(key))
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined
}
