"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/admin/image-upload-field"
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
import { deactivateProduct, getProduct, updateProduct } from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { formatPrice } from "@/lib/format-price"
import { queryKeys } from "@/lib/query-keys"
import type { Product } from "@/lib/types/product"

export function AdminProductEditor() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: product, isPending, isError } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  })

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  if (isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Could not open this product.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>
    )
  }

  return (
    <AdminProductEditorForm
      key={product.id}
      product={product}
      categories={categories}
      onSaved={(updatedProduct) => {
        toast.success("Changes saved")
        queryClient.setQueryData(queryKeys.products.detail(id), updatedProduct)
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      }}
      onHidden={() => {
        toast.success("Product hidden from the shop")
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
        router.push("/admin/products")
      }}
    />
  )
}

function AdminProductEditorForm({
  categories,
  onHidden,
  onSaved,
  product,
}: {
  categories: { id: string; name: string }[] | undefined
  onHidden: () => void
  onSaved: (product: Product) => void
  product: Product
}) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? "")
  const [sku, setSku] = useState(product.sku)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(String(product.stock))
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl)

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProduct(product.id, {
        name,
        description,
        sku,
        categoryId,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock, 10) || 0,
        imageUrl,
      }),
    onSuccess: onSaved,
    onError: (error) => toastApiError(error),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateProduct(product.id),
    onSuccess: onHidden,
    onError: (error) => toastApiError(error),
  })

  const dirty =
    name !== product.name ||
    description !== (product.description ?? "") ||
    sku !== product.sku ||
    categoryId !== product.categoryId ||
    price !== product.price ||
    stock !== String(product.stock) ||
    imageUrl !== product.imageUrl

  return (
    <div className="space-y-8">
      <Link
        href="/admin/products"
        className="inline-flex h-10 items-center bg-white px-4 text-sm font-medium text-neutral-950 ring-1 ring-border/60 transition-colors hover:bg-muted/30"
      >
        Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(22rem,34rem)_minmax(0,1fr)]">
        <ImageUploadField
          id={`edit-product-image-${product.id}`}
          label="Product image"
          folder="products"
          value={imageUrl}
          onChange={setImageUrl}
          mode="hero"
          previewAlt={name}
          className="w-full min-w-0"
        />

        <div className="space-y-7">
          <div className="space-y-3">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-8 w-fit border-x-0 border-t-0 bg-transparent px-0 text-xs font-medium uppercase tracking-wider text-[var(--luxian-teal)] focus-visible:ring-0">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <textarea
              value={name}
              onChange={(event) => setName(event.target.value)}
              rows={3}
              className="min-h-44 w-full resize-none bg-transparent font-display text-5xl font-bold uppercase leading-none outline-none"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a product description"
              className="min-h-28 w-full resize-none bg-transparent text-sm leading-relaxed text-muted-foreground outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PlainField label="Price" value={price} onChange={setPrice} />
            <PlainField label="Stock" value={stock} onChange={setStock} />
          </div>

          <PlainField label="Product code" value={sku} onChange={setSku} />

          <div className="border-t border-border/60 pt-5">
            <p className="mb-4 text-sm text-muted-foreground">
              {dirty
                ? "You have unsaved changes on this product."
                : `This product is currently shown as ${formatPrice(product.price)}.`}
            </p>
            <Button
              type="button"
              disabled={!dirty || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="w-full"
            >
              {saveMutation.isPending ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-6">
        <Button
          type="button"
          variant="destructive"
          disabled={deactivateMutation.isPending}
          onClick={() => deactivateMutation.mutate()}
        >
          {deactivateMutation.isPending ? "Hiding product..." : "Hide this product"}
        </Button>
      </div>
    </div>
  )
}

function PlainField({
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
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
      />
    </div>
  )
}
