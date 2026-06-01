"use client"

import { ArrowDown01Icon, ArrowUp01Icon, Folder01Icon, MultiplicationSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { ImageUploadField } from "@/components/admin/image-upload-field"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  addCollectionProducts,
  createCollection,
  deactivateCollection,
  getCollectionsForAdmin,
  removeCollectionProduct,
  reorderCollectionProducts,
  updateCollection,
} from "@/features/collections/api"
import { getCategories } from "@/features/categories/api"
import { revalidatePublicHomepage } from "@/features/homepage/revalidate"
import { getProductsBulk } from "@/features/products/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"
import type { Product } from "@/lib/types/product"

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

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.collections.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.homepage })
    void revalidatePublicHomepage().catch(() => {
      toast.warning("Saved. Public page may take a moment to refresh.")
    })
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
        <span className="block font-display text-4xl leading-none font-bold text-neutral-950 uppercase sm:text-5xl">
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

      {!isPending && !collections?.length && <p className="text-sm text-muted-foreground">No collections yet.</p>}

      <div className="space-y-5">
        {collections?.map((collection) => (
          <CollectionEditor
            key={collection.id}
            collection={collection}
            categories={categories ?? []}
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
        <TextField label="Slug" value={slug} onChange={setSlug} placeholder="summer-season" />
        <TextField label="Description" value={description} onChange={setDescription} className="sm:col-span-2" />
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
  categories,
  collection,
  onChanged,
  products,
}: {
  categories: { id: string; name: string }[]
  collection: Collection
  onChanged: () => void
  products: Product[]
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(collection.name)
  const [slug, setSlug] = useState(collection.slug)
  const [description, setDescription] = useState(collection.description ?? "")
  const [imageUrl, setImageUrl] = useState<string | null>(collection.imageUrl)

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
    mutationFn: (productIds: string[]) => addCollectionProducts(collection.id, productIds),
    onSuccess: () => {
      toast.success("Products added")
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
    <section className="bg-white ring-1 ring-border/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid w-full gap-4 p-5 text-left transition-colors hover:bg-neutral-50 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="relative size-18 overflow-hidden bg-muted">
          {collection.imageUrl ? (
            <StoreImage src={collection.imageUrl} alt={collection.name} fill className="object-cover" sizes="72px" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground uppercase">
              Luxian
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {items.length} product{items.length === 1 ? "" : "s"} · /{collection.slug}
          </p>
          <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">{collection.name}</h2>
          {collection.description && (
            <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{open ? "Close" : "Edit"}</span>
      </button>

      {open && (
        <div className="grid gap-6 border-t border-border/60 p-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="space-y-4">
            <ImageUploadField
              id={`collection-image-${collection.id}`}
              folder="collections"
              value={imageUrl}
              onChange={setImageUrl}
              owner={{ ownerType: "COLLECTION", ownerId: collection.id }}
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
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Product order</p>
              <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">Products</h2>
            </div>

            <ProductPickerDialog
              availableProducts={availableProducts}
              categories={categories}
              busy={addMutation.isPending}
              onAdd={(productIds) => addMutation.mutate(productIds)}
            />

            {!items.length && <p className="text-sm text-muted-foreground">No products in this collection yet.</p>}

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
                    <p className="leading-snug font-medium">{item.product.name}</p>
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
        </div>
      )}
    </section>
  )
}

function ProductPickerDialog({
  availableProducts,
  busy,
  categories,
  onAdd,
}: {
  availableProducts: Product[]
  busy: boolean
  categories: { id: string; name: string }[]
  onAdd: (productIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const selectedProducts = selectedIds
    .map((id) => availableProducts.find((product) => product.id === id))
    .filter(Boolean) as Product[]
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch =
      !search.trim() ||
      product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      product.sku.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory = !categoryId || product.categoryId === categoryId
    return matchesSearch && matchesCategory
  })

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSelectedIds([])
          setSearch("")
          setCategoryId("")
        }
      }}
    >
      <Button type="button" onClick={() => setOpen(true)}>
        Add products
      </Button>
      <DialogContent>
        <div className="grid max-h-[92svh] overflow-hidden lg:max-h-[88svh] lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
            <div className="mx-auto h-1 w-11 bg-muted-foreground/30 sm:hidden" />
            <DialogHeader>
              <DialogTitle>Add products</DialogTitle>
              <DialogDescription>
                Search the catalog, select multiple products, then add them to the collection.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:gap-4">
              <div className="space-y-2">
                <Label>Search products</Label>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name or SKU"
                  className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryId || "all"}
                  onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const selected = selectedIds.includes(product.id)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 bg-white p-2 text-left ring-1 transition-colors sm:block sm:p-3 ${
                      selected ? "ring-neutral-950" : "ring-border/60 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="relative size-[4.5rem] overflow-hidden bg-muted sm:aspect-[4/5] sm:size-auto">
                      {product.imageUrl ? (
                        <StoreImage
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 sm:group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 72px, 220px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground uppercase">
                          Luxian
                        </div>
                      )}
                      {selected && (
                        <span className="absolute top-2 right-2 bg-neutral-950 px-2 py-1 text-xs font-medium text-white">
                          <span className="hidden sm:inline">Selected</span>
                          <span className="sm:hidden">On</span>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 sm:mt-3">
                      <p className="line-clamp-2 text-sm leading-snug font-medium sm:text-base">{product.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{product.category?.name ?? "Uncategorized"}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {!filteredProducts.length && <p className="text-sm text-muted-foreground">No matching products to add.</p>}
          </div>

          <aside className="hidden min-h-0 border-t border-border/60 bg-muted/30 p-4 sm:p-5 lg:block lg:border-t-0 lg:border-l">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Selected so far</p>
            <div className="mt-3 flex max-h-28 gap-2 overflow-x-auto lg:mt-4 lg:block lg:max-h-[46svh] lg:space-y-2 lg:overflow-x-visible lg:overflow-y-auto">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid min-w-56 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 bg-white p-2 lg:min-w-0"
                >
                  <div className="relative size-12 overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <StoreImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <p className="min-w-0 truncate text-sm font-medium">{product.name}</p>
                  <button
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className="flex size-8 items-center justify-center text-muted-foreground hover:text-neutral-950"
                  >
                    <HugeiconsIcon icon={MultiplicationSignIcon} className="size-4" />
                  </button>
                </div>
              ))}
              {!selectedProducts.length && <p className="text-sm text-muted-foreground">Nothing selected yet.</p>}
            </div>

            <DialogFooter className="mt-5">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                disabled={!selectedIds.length || busy}
                onClick={() => {
                  onAdd(selectedIds)
                  setOpen(false)
                }}
              >
                {busy ? "Adding..." : `Add ${selectedIds.length || ""} products`}
              </Button>
            </DialogFooter>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
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
