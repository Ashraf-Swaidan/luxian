"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type DynamicModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
  bodyClassName?: string
  fullscreen?: boolean
  bodyScroll?: boolean
  showClose?: boolean
  /** Single-line title instead of display heading. */
  compactTitle?: boolean
}

export function DynamicModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  fullscreen = false,
  bodyScroll = true,
  showClose = true,
  compactTitle = false,
}: DynamicModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0",
          fullscreen &&
            "inset-0 top-0 left-0 h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:slide-in-from-bottom-0 sm:inset-0 sm:top-0 sm:left-0 sm:h-[100dvh] sm:max-h-[100dvh] sm:w-full sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:rounded-none",
          contentClassName,
        )}
      >
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            fullscreen ? "h-[100dvh] max-h-[100dvh]" : "max-h-[92svh] sm:max-h-[88svh]",
            bodyClassName,
          )}
        >
          <div
            className={cn(
              "relative shrink-0 border-b border-border/60",
              compactTitle ? "flex h-11 items-center px-4 sm:px-5" : "space-y-1 px-4 py-4 sm:px-6",
            )}
          >
            {!compactTitle ? (
              <div className="mx-auto mb-2 h-1 w-11 bg-muted-foreground/30 sm:hidden" />
            ) : null}
            {showClose ? (
              <DialogClose
                className={cn(
                  "absolute flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
                  compactTitle ? "top-1/2 right-3 -translate-y-1/2 sm:right-4" : "top-4 right-4 sm:top-5 sm:right-6",
                )}
                aria-label="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.8} />
              </DialogClose>
            ) : null}
            <DialogHeader className={cn(compactTitle ? "gap-0 pr-9" : "gap-1 pr-10")}>
              <DialogTitle
                className={cn(
                  compactTitle
                    ? "text-sm font-medium normal-case tracking-normal"
                    : "text-2xl sm:text-3xl",
                )}
              >
                {title}
              </DialogTitle>
              {!compactTitle && description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </DialogHeader>
          </div>
          <div
            className={cn(
              "min-h-0 flex-1",
              bodyScroll ? "overflow-y-auto" : "flex h-0 flex-col overflow-hidden",
            )}
          >
            {children}
          </div>
          {footer ? (
            <DialogFooter className="shrink-0 border-t border-border/60 px-4 py-4 sm:px-6">
              {footer}
            </DialogFooter>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
