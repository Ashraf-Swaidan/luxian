"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
} from "@/features/categories/api"
import { ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { Category } from "@/lib/types/category"

function showError(error: unknown) {
  const message =
    error instanceof ApiError
      ? error.messages.join(", ")
      : error instanceof Error
        ? error.message
        : "Request failed"
  toast.error(message)
}

export function AdminCategoriesPanel() {
  const queryClient = useQueryClient()
  const { data: categories, isPending } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  })

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created")
      setName("")
      setSlug("")
      setDescription("")
      invalidate()
    },
    onError: showError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string } }) =>
      updateCategory(id, body),
    onSuccess: () => {
      toast.success("Category updated")
      invalidate()
    },
    onError: showError,
  })

  const deleteMutation = useMutation({
    mutationFn: deactivateCategory,
    onSuccess: () => {
      toast.success("Category deactivated")
      invalidate()
    },
    onError: showError,
  })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>New category</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <Button
            className="sm:col-span-2"
            disabled={createMutation.isPending || !name || !slug}
            onClick={() =>
              createMutation.mutate({
                name,
                slug,
                description: description || undefined,
              })
            }
          >
            Create category
          </Button>
        </CardContent>
      </Card>

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
              onRename={(newName) =>
                updateMutation.mutate({ id: cat.id, body: { name: newName } })
              }
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
  onRename,
  onDeactivate,
  busy,
}: {
  category: Category
  onRename: (name: string) => void
  onDeactivate: () => void
  busy: boolean
}) {
  const [editName, setEditName] = useState(category.name)

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
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
        <Button
          size="sm"
          variant="outline"
          disabled={busy || editName === category.name}
          onClick={() => onRename(editName)}
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={onDeactivate}>
          Deactivate
        </Button>
      </div>
    </li>
  )
}
