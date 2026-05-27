"use client"

import { useEffect, useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AdminCollapsibleFormProps = {
  title: string
  description?: string
  addLabel?: string
  children: ReactNode
  className?: string
  /** Increment to close the panel and remount form fields (e.g. after create) */
  resetSignal?: number
}

export function AdminCollapsibleForm({
  title,
  description,
  addLabel = "Add new",
  children,
  className,
  resetSignal = 0,
}: AdminCollapsibleFormProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [resetSignal])

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Button
          type="button"
          variant={open ? "ghost" : "outline"}
          size="sm"
          className="shrink-0"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Cancel" : addLabel}
        </Button>
      </CardHeader>
      {open && (
        <CardContent
          key={resetSignal}
          className="grid gap-4 border-t border-border/60 pt-6 sm:grid-cols-2"
        >
          {children}
        </CardContent>
      )}
    </Card>
  )
}
