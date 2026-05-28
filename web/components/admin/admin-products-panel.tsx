"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { StoreImage } from "@/components/common/store-image"
import { toast } from "sonner"

import { AdminCollapsibleForm } from "@/components/admin/admin-collapsible-form"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories } from "@/features/categories/api"
import {
  createProduct,
  deactivateProduct,
  getProductsBulk,
  updateProduct,
} from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/lib/types/product"

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
      toast.success("Product created")
      onCreated()
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (e) => toastApiError(e),
  })

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="prod-name">Name</Label>
        <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prod-sku">SKU</Label>
        <Input id="prod-sku" value={sku} onChange={(e) => setSku(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prod-price">Price</Label>
        <Input
          id="prod-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prod-stock">Stock</Label>
        <Input
          id="prod-stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="prod-cat">Category</Label>
        <select
          id="prod-cat"
          value={defaultCategory}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-9 w-full rounded-xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="prod-desc">Description</Label>
        <Input
          id="prod-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ImageUploadField
        id="prod-image"
        folder="products"
        value={imageUrl}
        onChange={setImageUrl}
        className="sm:col-span-2"
      />
      <Button
        className="sm:col-span-2"
        disabled={
          createMutation.isPending || !name || !sku || !price || !defaultCategory
        }
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
        {createMutation.isPending ? "Creating…" : "Create product"}
      </Button>
    </>
  )
}

export function AdminProductsPanel() {
  const queryClient = useQueryClient()
  const [formReset, setFormReset] = useState(0)

  const { data: products, isPending: productsLoading } = useQuery({
    queryKey: queryKeys.products.list({ limit: 48 }),
    queryFn: () => getProductsBulk(),
  })

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { price?: number; stock?: number; imageUrl?: string | null }
    }) => updateProduct(id, body),
    onSuccess: () => {
      toast.success("Product updated")
      invalidate()
    },
    onError: (e) => toastApiError(e),
  })

  const deleteMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      toast.success("Product deactivated")
      invalidate()
    },
    onError: (e) => toastApiError(e),
  })

  return (
    <div className="space-y-8">
      <AdminCollapsibleForm
        title="New product"
        description="Add a product to the catalog. Upload an image, then create."
        addLabel="Add product"
        resetSignal={formReset}
      >
        <NewProductForm
          categories={categories}
          onCreated={() => setFormReset((n) => n + 1)}
        />
      </AdminCollapsibleForm>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Active products</h2>
        {productsLoading && <Skeleton className="h-24 w-full" />}
        {!productsLoading && !products?.data?.length && (
          <p className="text-sm text-muted-foreground">No active products.</p>
        )}
        <ul className="space-y-2">
          {products?.data.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onUpdate={(body) => updateMutation.mutate({ id: product.id, body })}
              onDeactivate={() => deleteMutation.mutate(product.id)}
              busy={updateMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}

function ProductRow({
  product,
  onUpdate,
  onDeactivate,
  busy,
}: {
  product: Product
  onUpdate: (body: { price?: number; stock?: number; imageUrl?: string | null }) => void
  onDeactivate: () => void
  busy: boolean
}) {
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(String(product.stock))
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl)
  const [showImage, setShowImage] = useState(false)

  const dirty =
    price !== product.price ||
    stock !== String(product.stock) ||
    imageUrl !== product.imageUrl

  return (
    <li className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          {product.imageUrl && (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              <StoreImage
                src={product.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}
          <div className="space-y-1 text-sm">
            <p className="font-medium">{product.name}</p>
            <p className="text-muted-foreground">
              {product.sku} · {product.category?.name ?? "—"} · {formatPrice(product.price)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2 lg:shrink-0">
          <div className="space-y-1">
            <Label className="text-xs">Price</Label>
            <Input
              type="number"
              step="0.01"
              className="h-8 w-24"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stock</Label>
            <Input
              type="number"
              className="h-8 w-20"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowImage((v) => !v)}
          >
            {showImage ? "Hide image" : "Image"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !dirty}
            onClick={() =>
              onUpdate({
                price: Number.parseFloat(price),
                stock: Number.parseInt(stock, 10),
                imageUrl,
              })
            }
          >
            {busy ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={onDeactivate}>
            Deactivate
          </Button>
        </div>
      </div>
      {showImage && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <ImageUploadField
            id={`prod-image-${product.id}`}
            label="Product image"
            folder="products"
            value={imageUrl}
            onChange={setImageUrl}
            compact
          />
        </div>
      )}
    </li>
  )
}
