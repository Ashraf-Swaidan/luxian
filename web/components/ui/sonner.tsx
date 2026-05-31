"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />,
        info: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />,
        warning: <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />,
        error: <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />,
        loading: <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "oklch(0.94 0.08 195)",
          "--success-text": "oklch(0.18 0.06 195)",
          "--success-border": "oklch(0.78 0.12 195)",
          "--error-bg": "oklch(0.94 0.12 65)",
          "--error-text": "oklch(0.24 0.08 45)",
          "--error-border": "oklch(0.78 0.15 55)",
          "--warning-bg": "oklch(0.94 0.12 65)",
          "--warning-text": "oklch(0.24 0.08 45)",
          "--warning-border": "oklch(0.78 0.15 55)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast rounded-none border shadow-none font-sans text-sm [&_[data-close-button]]:hidden",
          success: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
          error: "border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]",
          warning: "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
