"use client"

import { ArrowDown01Icon, ArrowUp01Icon, Folder01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
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
import {
  addCollectionProduct,
  createCollection,
  deactivateCollection,
  getCollectionsForAdmin,
  removeCollectionProduct,
  reorderCollectionProducts,
  updateCollection,
} from "@/features/collections/api"
import { getProductsBulk } from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"

export function AdminCollectionsPanel() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: collections, isPending } = useQuery({
    queryKey: queryKeys.collections.admin,
    queryFn: getCollectionsForAdmin,
  })

  const { data: products } = useQuery({
    queryKey: queryKeys.products.list({ page: 1, limit: 48 }),
    queryFn: () => getProductsBulk(48),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.collections.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.homepage })
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => setShowCreate((value) => !value)}
        className="group flex min-h-28 w-full items-center justify-center gap-4 bg-white px-5 py-5 text-center ring-1 ring-border/60 transition-transform hover:scale-[1.01] hover:bg-neutral-100"
      >
        <span className="flex size-12 shrink-0 items-center justify-center bg-[oklch(0.82_0.16_85)] text-neutral-950 transition-transform group-hover:scale-105">
          <HugeiconsIcon icon={Folder01Icon} className="size-6" strokeWidth={1.7} />
        </span>
        <span className="block font-display text-4xl font-bold uppercase leading-none text-neutral-950 sm:text-5xl">
          Add Collection
        </span>
      </button>

      {showCreate && (
        <NewCollectionForm
          onCreated={() => {
            setShowCreate(false)
            invalidate()
          }}
        />
      )}

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isPending && !collections?.length && (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      )}

      <div className="space-y-5">
        {collections?.map((collection) => (
          <CollectionEditor
            key={collection.id}
            collection={collection}
            products={products?.data ?? []}
            onChanged={invalidate}
          />
        ))}
      </div>
    </div>
  )
}

function NewCollectionForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      toast.success("Collection created")
      onCreated()
    },
    onError: (error) => toastApiError(error),
  })

  return (
    <div className="bg-white p-6 ring-1 ring-border/60">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" value={name} onChange={setName} placeholder="Summer Season" />
        <TextField
          label="Slug"
          value={slug}
          onChange={setSlug}
          placeholder="summer-season"
        />
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
          className="sm:col-span-2"
        />
        <ImageUploadField
          id="new-collection-image"
          folder="collections"
          value={imageUrl}
          onChange={setImageUrl}
          className="sm:col-span-2"
        />
        <Button
          type="button"
          className="sm:col-span-2"
          disabled={createMutation.isPending || !name || !slug}
          onClick={() =>
            createMutation.mutate({
              name,
              slug,
              description: description || undefined,
              imageUrl: imageUrl ?? undefined,
            })
          }
        >
          {createMutation.isPending ? "Creating..." : "Create collection"}
        </Button>
      </div>
    </div>
  )
}

function CollectionEditor({
  collection,
  onChanged,
  products,
}: {
  collection: Collection
  onChanged: () => void
  products: { id: string; name: string; imageUrl: string | null }[]
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(collection.name)
  const [slug, setSlug] = useState(collection.slug)
  const [description, setDescription] = useState(collection.description ?? "")
  const [imageUrl, setImageUrl] = useState<string | null>(collection.imageUrl)
  const [selectedProductId, setSelectedProductId] = useState("")

  const items = collection.collectionProducts ?? []
  const usedProductIds = new Set(items.map((item) => item.productId))
  const availableProducts = products.filter((product) => !usedProductIds.has(product.id))
  const dirty =
    name !== collection.name ||
    slug !== collection.slug ||
    description !== (collection.description ?? "") ||
    imageUrl !== collection.imageUrl

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.collections.admin })
    onChanged()
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCollection(collection.id, {
        name,
        slug,
        description: description || null,
        imageUrl,
      }),
    onSuccess: () => {
      toast.success("Collection saved")
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateCollection(collection.id),
    onSuccess: () => {
      toast.success("Collection hidden")
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const addMutation = useMutation({
    mutationFn: (productId: string) => addCollectionProduct(collection.id, productId),
    onSuccess: () => {
      setSelectedProductId("")
      toast.success("Product added")
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeCollectionProduct(collection.id, productId),
    onSuccess: () => {
      toast.success("Product removed")
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const reorderMutation = useMutation({
    mutationFn: (productIds: string[]) => reorderCollectionProducts(collection.id, productIds),
    onSuccess: () => {
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = items.map((item) => item.productId)
    const target = index + direction
    if (target < 0 || target >= next.length) {
      return
    }
    ;[next[index], next[target]] = [next[target], next[index]]
    reorderMutation.mutate(next)
  }

  return (
    <section className="grid gap-6 bg-white p-6 ring-1 ring-border/60 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="space-y-4">
        <ImageUploadField
          id={`collection-image-${collection.id}`}
          folder="collections"
          value={imageUrl}
          onChange={setImageUrl}
        />
        <TextField label="Name" value={name} onChange={setName} />
        <TextField label="Slug" value={slug} onChange={setSlug} />
        <TextField label="Description" value={description} onChange={setDescription} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!dirty || updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deactivateMutation.isPending}
            onClick={() => deactivateMutation.mutate()}
          >
            Hide collection
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Product order
          </p>
          <h2 className="font-display text-4xl font-bold uppercase leading-none text-neutral-950">
            {collection.name}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
              <SelectValue placeholder="Choose product to add" />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={!selectedProductId || addMutation.isPending}
            onClick={() => addMutation.mutate(selectedProductId)}
          >
            Add product
          </Button>
        </div>

        {!items.length && (
          <p className="text-sm text-muted-foreground">No products in this collection yet.</p>
        )}

        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="grid gap-3 bg-muted/30 p-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="relative size-14 overflow-hidden bg-white">
                {item.product.imageUrl ? (
                  <StoreImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    Luxian
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium leading-snug">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Position {index + 1}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  disabled={index === 0 || reorderMutation.isPending}
                  onClick={() => moveItem(index, -1)}
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  disabled={index === items.length - 1 || reorderMutation.isPending}
                  onClick={() => moveItem(index, 1)}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(item.productId)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TextField({
  className,
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
      />
    </div>
  )
}
