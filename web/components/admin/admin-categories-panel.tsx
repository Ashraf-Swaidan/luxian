"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { AdminCollapsibleForm } from "@/components/admin/admin-collapsible-form"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "@/features/categories/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { Category } from "@/lib/types/category"

function NewCategoryForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created")
      onCreated()
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (e) => toastApiError(e),
  })

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Electronics"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="electronics"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="cat-desc">Description</Label>
        <Input
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ImageUploadField
        id="cat-image"
        folder="categories"
        value={imageUrl}
        onChange={setImageUrl}
        className="sm:col-span-2"
      />
      <Button
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
        {createMutation.isPending ? "Creating…" : "Create category"}
      </Button>
    </>
  )
}

export function AdminCategoriesPanel() {
  const queryClient = useQueryClient()
  const [formReset, setFormReset] = useState(0)

  const { data: categories, isPending } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { name?: string; imageUrl?: string | null }
    }) => updateCategory(id, body),
    onSuccess: () => {
      toast.success("Category updated")
      invalidate()
    },
    onError: (e) => toastApiError(e),
  })

  const deleteMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => {
      toast.success("Category deactivated")
      invalidate()
    },
    onError: (e) => toastApiError(e),
  })

  return (
    <div className="space-y-8">
      <AdminCollapsibleForm
        title="New category"
        description="Categories group products in the shop."
        addLabel="Add category"
        resetSignal={formReset}
      >
        <NewCategoryForm onCreated={() => setFormReset((n) => n + 1)} />
      </AdminCollapsibleForm>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Active categories</h2>
        {isPending && <Skeleton className="h-24 w-full" />}
        {!isPending && !categories?.length && (
          <p className="text-sm text-muted-foreground">No active categories.</p>
        )}
        <ul className="space-y-2">
          {categories?.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onUpdate={(body) => updateMutation.mutate({ id: cat.id, body })}
              onDeactivate={() => deleteMutation.mutate(cat.id)}
              busy={updateMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}

function CategoryRow({
  category,
  onUpdate,
  onDeactivate,
  busy,
}: {
  category: Category
  onUpdate: (body: { name?: string; imageUrl?: string | null }) => void
  onDeactivate: () => void
  busy: boolean
}) {
  const [editName, setEditName] = useState(category.name)
  const [imageUrl, setImageUrl] = useState<string | null>(category.imageUrl)
  const [showImage, setShowImage] = useState(false)

  const dirty = editName !== category.name || imageUrl !== category.imageUrl

  return (
    <li className="rounded-md border border-border/60 bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-medium">{category.name}</p>
          <p className="text-muted-foreground">
            /{category.slug}
            {category.description ? ` · ${category.description}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-8 w-40"
          />
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowImage((v) => !v)}>
            {showImage ? "Hide image" : "Image"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !dirty}
            onClick={() => onUpdate({ name: editName, imageUrl })}
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
            id={`cat-image-${category.id}`}
            label="Category image"
            folder="categories"
            value={imageUrl}
            onChange={setImageUrl}
            compact
          />
        </div>
      )}
    </li>
  )
}
