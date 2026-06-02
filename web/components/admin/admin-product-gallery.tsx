"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef, useState, type RefObject } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
  updateProduct,
  updateProductImage,
} from "@/features/products/api"
import { deleteStorageObject } from "@/features/media/api"
import { hasPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import { useUploadThing } from "@/lib/uploadthing"
import { useAuth } from "@/providers/auth-provider"
import type { Product, ProductImage } from "@/lib/types/product"
import { cn } from "@/lib/utils"

type AdminProductGalleryProps = {
  product: Product
  coverUrl: string | null
  onCoverChange: (url: string | null) => void
}

type GalleryImage = ProductImage & {
  pendingCover?: boolean
}

export function AdminProductGallery({ product, coverUrl, onCoverChange }: AdminProductGalleryProps) {
  const queryClient = useQueryClient()
  const images = product.images ?? []
  const displayImages = buildDisplayImages(images, product, coverUrl)
  const [pendingDelete, setPendingDelete] = useState<ProductImage | null>(null)
  const { user } = useAuth()
  const canManageMedia = hasPermission(user, PERMISSIONS.MEDIA_WRITE)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detailKey = queryKeys.products.detail(product.id)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: detailKey })
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
  }

  const addMutation = useMutation({
    mutationFn: (url: string) => addProductImage(product.id, { url }),
    onSuccess: () => {
      invalidate()
      toast.success("Image added to gallery")
    },
    onError: (error) => toastApiError(error),
  })

  const { startUpload, isUploading } = useUploadThing("adminImage", {
    onClientUploadComplete: (res) => {
      const url = res[0]?.ufsUrl ?? res[0]?.url
      if (url) {
        addMutation.mutate(url)
      }
    },
    onUploadError: (error) => toastApiError(error, "Upload failed"),
  })

  const pickGalleryImage = () => {
    if (!canManageMedia || addMutation.isPending || isUploading) {
      return
    }
    fileInputRef.current?.click()
  }

  const onGalleryFileChange = (file: File | undefined) => {
    if (!file) {
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4 MB or smaller")
      return
    }
    void startUpload([file])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isAdding = addMutation.isPending || isUploading

  const setCoverMutation = useMutation({
    mutationFn: (url: string) => updateProduct(product.id, { imageUrl: url }),
    onSuccess: (updated) => {
      onCoverChange(updated.imageUrl)
      invalidate()
      toast.success("Cover image updated")
    },
    onError: (error) => toastApiError(error),
  })

  const altMutation = useMutation({
    mutationFn: ({ imageId, altText }: { imageId: string; altText: string | null }) =>
      updateProductImage(product.id, imageId, { altText }),
    onSuccess: () => invalidate(),
    onError: (error) => toastApiError(error),
  })

  const reorderMutation = useMutation({
    mutationFn: (imageIds: string[]) => reorderProductImages(product.id, imageIds),
    onSuccess: () => {
      invalidate()
    },
    onError: (error) => toastApiError(error),
  })

  const deleteMutation = useMutation({
    mutationFn: async (image: ProductImage) => {
      if (image.key) {
        await deleteStorageObject(image.key)
      }
      return deleteProductImage(product.id, image.id)
    },
    onSuccess: () => {
      setPendingDelete(null)
      invalidate()
      toast.success("Image removed")
    },
    onError: (error) => toastApiError(error),
  })

  const moveImage = (index: number, direction: -1 | 1) => {
    const next = [...images]
    const target = index + direction
    if (target < 0 || target >= next.length) {
      return
    }
    ;[next[index], next[target]] = [next[target], next[index]]
    reorderMutation.mutate(next.map((image) => image.id))
  }

  return (
    <>
      <DeleteGalleryImageDialog
        image={pendingDelete}
        deleting={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete)
          }
        }}
      />

      <section className="space-y-4 border-t border-border/60 pt-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Gallery</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add multiple images. Set one as the cover — it is used on cards and as the default on the product page.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {displayImages.map((image) => {
            const isCover = coverUrl === image.url
            const persistedIndex = images.findIndex((item) => item.id === image.id)
            const isPendingCover = Boolean(image.pendingCover)
            return (
              <li
                key={image.id}
                className={cn(
                  "space-y-3 rounded-md border border-border/60 p-3",
                  isCover && "border-[var(--luxian-teal)]/40 bg-muted/20"
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <StoreImage
                    src={image.url}
                    alt={image.altText ?? product.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  {isCover && (
                    <span className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-950 uppercase">
                      {isPendingCover ? "New cover" : "Cover"}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor={`alt-${image.id}`} className="text-xs">
                      Alt text
                    </Label>
                    <Input
                      id={`alt-${image.id}`}
                      defaultValue={image.altText ?? ""}
                      placeholder={product.name}
                      className="h-8 text-xs"
                      disabled={isPendingCover}
                      onBlur={(event) => {
                        const next = event.target.value.trim() || null
                        if (next !== (image.altText ?? null)) {
                          altMutation.mutate({ imageId: image.id, altText: next })
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={isCover ? "secondary" : "outline"}
                      className="h-7 text-xs"
                      disabled={isCover || isPendingCover || setCoverMutation.isPending}
                      onClick={() => setCoverMutation.mutate(image.url)}
                    >
                      {isPendingCover ? "Save first" : isCover ? "Cover" : "Set cover"}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-7 shrink-0"
                      disabled={isPendingCover || persistedIndex <= 0 || reorderMutation.isPending}
                      aria-label="Move image earlier"
                      onClick={() => moveImage(persistedIndex, -1)}
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="size-7 shrink-0"
                      disabled={isPendingCover || persistedIndex === images.length - 1 || reorderMutation.isPending}
                      aria-label="Move image later"
                      onClick={() => moveImage(persistedIndex, 1)}
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      disabled={isPendingCover}
                      onClick={() => setPendingDelete(image)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}

          <li>
            <GalleryAddCard
              disabled={!canManageMedia || isAdding}
              isUploading={isAdding}
              inputId={`product-gallery-add-${product.id}`}
              inputRef={fileInputRef}
              onPick={pickGalleryImage}
              onFileChange={onGalleryFileChange}
            />
          </li>
        </ul>
      </section>
    </>
  )
}

function buildDisplayImages(images: ProductImage[], product: Product, coverUrl: string | null): GalleryImage[] {
  if (coverUrl && images.some((image) => image.url === coverUrl)) {
    return images
  }

  const previousCoverIndex = images.findIndex((image) => image.url === product.imageUrl)

  if (!coverUrl) {
    return previousCoverIndex >= 0 ? images.filter((_, index) => index !== previousCoverIndex) : images
  }

  const pendingCover: GalleryImage = {
    id: `pending-cover-${coverUrl}`,
    url: coverUrl,
    key: null,
    altText: product.name,
    position: previousCoverIndex >= 0 ? images[previousCoverIndex].position : 0,
    pendingCover: true,
  }

  if (previousCoverIndex < 0) {
    return [pendingCover, ...images]
  }

  const next = [...images]
  next[previousCoverIndex] = pendingCover
  return next
}

function GalleryAddCard({
  disabled,
  inputId,
  inputRef,
  isUploading,
  onFileChange,
  onPick,
}: {
  disabled: boolean
  inputId: string
  inputRef: RefObject<HTMLInputElement | null>
  isUploading: boolean
  onFileChange: (file: File | undefined) => void
  onPick: () => void
}) {
  return (
    <div className="space-y-3 rounded-md border border-dashed border-border/80 p-3">
      <button
        type="button"
        disabled={disabled}
        onClick={onPick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onPick()
          }
        }}
        className={cn(
          "relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-muted/40 transition-colors",
          !disabled &&
            "cursor-pointer hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
        aria-label="Add gallery image"
      >
        {isUploading ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-7 animate-spin text-[var(--luxian-teal)]"
              strokeWidth={2}
            />
            <span className="text-xs font-medium text-muted-foreground">Uploading…</span>
          </>
        ) : (
          <>
            <span className="flex size-11 items-center justify-center rounded-full border border-border/60 bg-white/80">
              <HugeiconsIcon icon={Add01Icon} className="size-5 text-neutral-950" strokeWidth={2} />
            </span>
            <span className="text-sm font-medium text-neutral-950">Add</span>
          </>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled}
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
      </button>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Click to upload another image</p>
    </div>
  )
}

function DeleteGalleryImageDialog({
  image,
  deleting,
  onCancel,
  onConfirm,
}: {
  image: ProductImage | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={Boolean(image)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md gap-0 overflow-y-auto p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.22em] text-destructive uppercase">Permanent action</p>
          <DialogTitle className="text-3xl sm:text-4xl">Delete gallery image?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This removes the file from storage and deletes it from this product&apos;s gallery. If it was the cover, the
            next image becomes the cover automatically.
          </DialogDescription>
        </DialogHeader>
        {image && (
          <div className="relative mt-5 aspect-[4/5] w-full max-w-[10rem] overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
            <StoreImage src={image.url} alt="" fill className="object-cover" sizes="160px" />
          </div>
        )}
        <DialogFooter className="mt-6 gap-2">
          <Button type="button" variant="outline" disabled={deleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={deleting} onClick={onConfirm}>
            {deleting ? "Deleting…" : "Delete forever"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
