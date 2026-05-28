"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { useRef } from "react"

import { StoreImage } from "@/components/common/store-image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getAccessToken } from "@/lib/auth-storage"
import { toastApiError } from "@/lib/error-message"
import type { UploadFolder } from "@/features/uploads/api"
import { useUploadThing } from "@/lib/uploadthing"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

type ImageUploadFieldProps = {
  id: string
  label?: string
  folder: UploadFolder
  value: string | null
  onChange: (url: string | null) => void
  className?: string
  compact?: boolean
}

export function ImageUploadField({
  id,
  label = "Image",
  value,
  onChange,
  className,
  compact,
}: ImageUploadFieldProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const inputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("adminImage", {
    headers: (): Record<string, string> => {
      const token = getAccessToken()
      return { Authorization: `Bearer ${token ?? ""}` }
    },
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
    if (!isAdmin) {
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

  const previewSize = compact ? "size-16" : "size-24"

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/60 bg-muted",
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
          {isAdmin ? (
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
