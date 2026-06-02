"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const HEX_INPUT_PATTERN = /^#?[0-9A-Fa-f]{0,6}$/

type HomepageColorFieldProps = {
  className?: string
  defaultColor: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function HomepageColorField({
  className,
  defaultColor,
  label,
  onChange,
  value,
}: HomepageColorFieldProps) {
  const pickerValue = value || defaultColor

  const handleHexInput = (next: string) => {
    if (!next) {
      onChange("")
      return
    }
    const normalized = next.startsWith("#") ? next : `#${next}`
    if (HEX_INPUT_PATTERN.test(normalized.replace("#", "")) || normalized === "#") {
      onChange(normalized === "#" ? "" : normalized)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 cursor-pointer rounded-sm border border-border/60 bg-transparent p-0.5"
          aria-label={`${label} picker`}
        />
        <Input
          value={value}
          onChange={(event) => handleHexInput(event.target.value)}
          placeholder={defaultColor}
          className="max-w-[8.5rem] border-x-0 border-t-0 bg-transparent px-0 font-mono text-xs uppercase focus-visible:ring-0"
        />
        {value ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onChange("")}>
            Reset
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Default</span>
        )}
      </div>
    </div>
  )
}

export function HomepageColorFields({
  children,
  title = "Section colors",
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="space-y-4 border-t border-border/60 pt-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}
