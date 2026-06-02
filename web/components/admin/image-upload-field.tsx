"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { useRef } from "react"

import { StoreImage } from "@/components/common/store-image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { hasAnyPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import { toastApiError } from "@/lib/error-message"
import type { UploadFolder } from "@/features/uploads/api"
import { useUploadThing } from "@/lib/uploadthing"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

import { ImageUploadHistory, type ImageUploadOwner } from "./image-upload-history"

type ImageUploadFieldProps = {
  id: string
  label?: string
  folder: UploadFolder
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  compact?: boolean
  mode?: "default" | "hero"
  previewAlt?: string
  owner?: ImageUploadOwner
}

export function ImageUploadField({
  id,
  label = "Image",
  value,
  onChange,
  className,
  compact,
  mode = "default",
  previewAlt = "",
  owner,
}: ImageUploadFieldProps) {
  const { user } = useAuth()
  const canUpload = hasAnyPermission(user, [PERMISSIONS.MEDIA_WRITE, PERMISSIONS.PRODUCTS_WRITE])
  const inputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("adminImage", {
    onClientUploadComplete: (res) => {
      const url = res[0]?.ufsUrl ?? res[0]?.url
      if (url) {
        onChange(url)
        toast.success("Image uploaded")
      }
    },
    onUploadError: (error) => {
      toastApiError(error, "Upload failed")
    },
  })

  const pickFile = () => {
    if (!canUpload) {
      return
    }
    inputRef.current?.click()
  }

  const onFileChange = (file: File | undefined) => {
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
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const previewSize = mode === "hero" ? "aspect-[4/5] w-full" : compact ? "size-16" : "size-24"
  const showHistory = Boolean(owner?.ownerId)

  if (mode === "hero") {
    return (
      <div className={cn("w-full space-y-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={id} className="sr-only">
            {label}
          </Label>
          {showHistory && owner && (
            <ImageUploadHistory owner={owner} currentUrl={value} onSelectUrl={(url) => onChange(url)} />
          )}
        </div>
        <div
          role={canUpload ? "button" : undefined}
          tabIndex={canUpload ? 0 : undefined}
          onClick={pickFile}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              pickFile()
            }
          }}
          className={cn(
            "group relative min-h-[26rem] overflow-hidden bg-muted",
            canUpload && "cursor-pointer",
            previewSize,
          )}
        >
          {value ? (
            <StoreImage src={value} alt={previewAlt} fill className="object-cover" sizes="60vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image yet
            </div>
          )}
          {canUpload && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium uppercase tracking-wide text-white opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
              Click to change
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[1px]">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-6 animate-spin text-[var(--luxian-teal)]"
                strokeWidth={2}
              />
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          )}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {showHistory && owner && (
          <ImageUploadHistory owner={owner} currentUrl={value} onSelectUrl={(url) => onChange(url)} />
        )}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <div
          role={canUpload ? "button" : undefined}
          tabIndex={canUpload ? 0 : undefined}
          onClick={pickFile}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              pickFile()
            }
          }}
          className={cn(
            "relative overflow-hidden rounded-md border border-border/60 bg-muted",
            canUpload && "cursor-pointer",
            previewSize,
          )}
        >
          {value ? (
            <StoreImage src={value} alt="" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              No image
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80 backdrop-blur-[1px]">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-5 animate-spin text-[var(--luxian-teal)]"
                strokeWidth={2}
              />
              <span className="text-[10px] font-medium">Uploading…</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
          {canUpload ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={pickFile}
            >
              {isUploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Sign in as admin to upload images.</p>
          )}
          {value && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
