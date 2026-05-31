"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSearchIcon,
  FilterHorizontalIcon,
  PackageAddIcon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/admin/image-upload-field"
import { StoreImage } from "@/components/common/store-image"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories } from "@/features/categories/api"
import { createProduct, getProducts } from "@/features/products/api"
import type { ProductListParams } from "@/features/products/types"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"

const PAGE_SIZE = 10
const ALL_CATEGORIES = "all"

export function AdminProductsPanel() {
  const [showCreate, setShowCreate] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minStock, setMinStock] = useState("")
  const [maxStock, setMaxStock] = useState("")

  const productParams = useMemo<ProductListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      categoryId: categoryId || undefined,
      minPrice: toNumber(minPrice),
      maxPrice: toNumber(maxPrice),
      minStock: toNumber(minStock),
      maxStock: toNumber(maxStock),
    }),
    [categoryId, maxPrice, maxStock, minPrice, minStock, page, search],
  )

  const { data: products, isPending: productsLoading } = useQuery({
    queryKey: queryKeys.products.list(productParams),
    queryFn: () => getProducts(productParams),
  })

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const resetToFirstPage = () => setPage(1)

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => setShowCreate((value) => !value)}
        className="group flex min-h-56 w-full flex-col items-center justify-center gap-6 bg-white p-8 text-center ring-1 ring-border/60 transition-colors hover:bg-neutral-950"
      >
        <span className="flex size-16 shrink-0 items-center justify-center bg-[oklch(0.82_0.16_85)] text-neutral-950 transition-transform group-hover:scale-105">
          <HugeiconsIcon icon={PackageAddIcon} className="size-8" strokeWidth={1.7} />
        </span>
        <span className="block font-display text-5xl font-bold uppercase leading-none text-neutral-950 transition-colors group-hover:text-white sm:text-6xl">
          Add New Product
        </span>
      </button>

      {showCreate && (
        <NewProductForm
          categories={categories}
          onCreated={() => {
            setShowCreate(false)
            setPage(1)
          }}
        />
      )}

      <section className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="product-search" className="flex items-center gap-2 text-xs uppercase">
              <HugeiconsIcon icon={AiSearchIcon} className="size-4" strokeWidth={1.8} />
              Search products
            </Label>
            <Input
              id="product-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetToFirstPage()
              }}
              placeholder="Type a product name"
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-filter" className="text-xs uppercase">
              Category
            </Label>
            <Select
              value={categoryId || ALL_CATEGORIES}
              onValueChange={(value) => {
                setCategoryId(value === ALL_CATEGORIES ? "" : value)
                resetToFirstPage()
              }}
            >
              <SelectTrigger
                id="category-filter"
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
            <NumberFilter label="Lowest price" value={minPrice} onChange={setMinPrice} />
            <NumberFilter label="Highest price" value={maxPrice} onChange={setMaxPrice} />
            <NumberFilter label="Minimum stock" value={minStock} onChange={setMinStock} />
            <NumberFilter label="Maximum stock" value={maxStock} onChange={setMaxStock} />
          </div>
        )}

        {productsLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] w-full" />
            ))}
          </div>
        )}

        {!productsLoading && !products?.data.length && (
          <p className="text-sm text-muted-foreground">No products found.</p>
        )}

        {!productsLoading && products?.data.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {products.data.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="group block bg-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <StoreImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <h2 className="mt-3 whitespace-normal break-words text-base font-medium leading-snug text-neutral-950">
                    {product.name}
                  </h2>
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-5 text-sm">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {products.meta.page} of {Math.max(products.meta.totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= products.meta.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}

function NewProductForm({
  categories,
  onCreated,
}: {
  categories: { id: string; name: string }[] | undefined
  onCreated: () => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("10")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const defaultCategory = categoryId || categories?.[0]?.id || ""

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product added")
      onCreated()
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => toastApiError(error),
  })

  return (
    <div className="bg-white p-6 ring-1 ring-border/60">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Product name" value={name} onChange={setName} />
        <TextField label="Product code" value={sku} onChange={setSku} />
        <TextField label="Price" type="number" value={price} onChange={setPrice} />
        <TextField label="Stock" type="number" value={stock} onChange={setStock} />
        <div className="space-y-2 sm:col-span-2">
          <Label>Category</Label>
          <select
            value={defaultCategory}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-10 w-full border-x-0 border-t-0 bg-transparent text-sm outline-none"
          >
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
          className="sm:col-span-2"
        />
        <ImageUploadField
          id="new-product-image"
          folder="products"
          value={imageUrl}
          onChange={setImageUrl}
          className="sm:col-span-2"
        />
        <Button
          type="button"
          className="sm:col-span-2"
          disabled={createMutation.isPending || !name || !sku || !price || !defaultCategory}
          onClick={() =>
            createMutation.mutate({
              name,
              sku,
              price: Number.parseFloat(price),
              stock: Number.parseInt(stock, 10) || 0,
              categoryId: defaultCategory,
              description: description || undefined,
              imageUrl: imageUrl ?? undefined,
            })
          }
        >
          {createMutation.isPending ? "Adding product..." : "Add product"}
        </Button>
      </div>
    </div>
  )
}

function NumberFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return <TextField label={label} type="number" value={value} onChange={onChange} />
}

function TextField({
  className,
  label,
  onChange,
  type = "text",
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
      />
    </div>
  )
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined
}
