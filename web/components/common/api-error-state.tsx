"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { getErrorMessage, getFriendlyErrorMessage } from "@/lib/error-message"
import { cn } from "@/lib/utils"

type ApiErrorStateProps = {
  error: unknown
  title?: string
  actionLabel?: string
  onRetry?: () => void
  className?: string
}

export function ApiErrorState({
  error,
  title = "Store data is unavailable",
  actionLabel = "Try again",
  onRetry,
  className,
}: ApiErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-md border border-destructive/25 bg-destructive/5 px-5 py-5 text-left",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{getFriendlyErrorMessage(error)}</p>
          {process.env.NODE_ENV !== "production" && (
            <p className="max-w-2xl font-mono text-xs break-words text-muted-foreground/80">{getErrorMessage(error)}</p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <HugeiconsIcon icon={RefreshIcon} className="size-4" strokeWidth={2} aria-hidden />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
