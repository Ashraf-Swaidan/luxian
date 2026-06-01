"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { deleteImageAsset, deleteStorageObject, getImageHistory } from "@/features/media/api"
import { toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"
import type { MediaAsset, MediaOwnerType } from "@/lib/types/media"
import { cn } from "@/lib/utils"

export type ImageUploadOwner = {
  ownerType: MediaOwnerType
  ownerId: string
  slot?: string
}

type ImageUploadHistoryProps = {
  owner: ImageUploadOwner
  currentUrl: string | null
  onSelectUrl: (url: string) => void
  className?: string
}

export function ImageUploadHistory({ owner, currentUrl, onSelectUrl, className }: ImageUploadHistoryProps) {
  const [open, setOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<MediaAsset | null>(null)
  const slot = owner.slot ?? "image"
  const queryClient = useQueryClient()
  const historyKey = queryKeys.media.history({
    ownerType: owner.ownerType,
    ownerId: owner.ownerId,
    slot,
  })

  const { data: history = [], isPending } = useQuery({
    queryKey: historyKey,
    queryFn: () =>
      getImageHistory({
        ownerType: owner.ownerType,
        ownerId: owner.ownerId,
        slot,
      }),
    enabled: open,
  })

  const deleteMutation = useMutation({
    mutationFn: async (asset: MediaAsset) => {
      if (asset.key) {
        await deleteStorageObject(asset.key)
      }
      await deleteImageAsset(asset.id)
    },
    onSuccess: () => {
      setPendingDelete(null)
      void queryClient.invalidateQueries({ queryKey: historyKey })
      toast.success("Image removed from storage")
    },
    onError: (error) => toastApiError(error, "Could not delete image"),
  })

  const priorCount = history.filter((item) => !item.isCurrent).length

  return (
    <>
    <DeleteImageDialog
      asset={pendingDelete}
      deleting={deleteMutation.isPending}
      onCancel={() => setPendingDelete(null)}
      onConfirm={() => {
        if (pendingDelete) {
          deleteMutation.mutate(pendingDelete)
        }
      }}
    />
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={className}>
          History{priorCount > 0 ? ` (${priorCount})` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="border-b border-border/60 px-3 py-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Image history</p>
          <p className="text-[11px] text-muted-foreground">Revert to a prior image, then save. Delete removes storage.</p>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {isPending && <p className="px-2 py-4 text-sm text-muted-foreground">Loading history…</p>}
          {!isPending && history.length === 0 && (
            <p className="px-2 py-4 text-sm text-muted-foreground">No prior images yet. Replace this image and save to build history.</p>
          )}
          <ul className="space-y-2">
            {history.map((asset) => (
              <HistoryRow
                key={asset.id}
                asset={asset}
                isActive={asset.url === currentUrl}
                deleting={deleteMutation.isPending && deleteMutation.variables?.id === asset.id}
                onUse={() => {
                  onSelectUrl(asset.url)
                  setOpen(false)
                  toast.message("Image selected — save to apply")
                }}
                onRequestDelete={() => {
                  setPendingDelete(asset)
                  setOpen(false)
                }}
              />
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
    </>
  )
}

function DeleteImageDialog({
  asset,
  deleting,
  onCancel,
  onConfirm,
}: {
  asset: MediaAsset | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={Boolean(asset)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md gap-0 overflow-y-auto p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.22em] text-destructive uppercase">Permanent action</p>
          <DialogTitle className="text-3xl sm:text-4xl">Delete this image?</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This removes the file from UploadThing storage forever. It will no longer appear in history and cannot be
            recovered.
          </DialogDescription>
        </DialogHeader>

        {asset && (
          <div className="relative mt-5 aspect-[4/5] w-full max-w-[10rem] overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
            <StoreImage src={asset.url} alt="" fill className="object-cover" sizes="160px" />
          </div>
        )}

        <DialogFooter className="mt-6 gap-2 sm:gap-2">
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

function HistoryRow({
  asset,
  deleting,
  isActive,
  onRequestDelete,
  onUse,
}: {
  asset: MediaAsset
  deleting: boolean
  isActive: boolean
  onRequestDelete: () => void
  onUse: () => void
}) {
  const canDelete = !asset.isCurrent && Boolean(asset.key)
  const deleteDisabledReason = asset.isCurrent
    ? "Cannot delete the current image"
    : !asset.key
      ? "Built-in or external images cannot be deleted from storage"
      : null

  return (
    <li
      className={cn(
        "flex gap-2 rounded-md border border-border/60 p-2",
        asset.isCurrent && "border-[var(--luxian-teal)]/40 bg-muted/30"
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <StoreImage src={asset.url} alt="" fill className="object-cover" sizes="56px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {asset.isCurrent && (
            <span className="rounded bg-[var(--luxian-teal)]/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--luxian-teal)] uppercase">
              Current
            </span>
          )}
          {isActive && !asset.isCurrent && (
            <span className="text-[10px] font-medium text-muted-foreground uppercase">Selected</span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={onUse}>
            Use this
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            disabled={!canDelete || deleting}
            title={deleteDisabledReason ?? undefined}
            onClick={onRequestDelete}
          >
            {deleting ? "Deleting…" : "Delete forever"}
          </Button>
        </div>
      </div>
    </li>
  )
}
