"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export function AdminBackLink() {
  const pathname = usePathname()
  const isOverview = pathname === "/admin" || pathname === "/admin/"

  if (isOverview) {
    return null
  }

  return (
    <Link
      href="/admin"
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={1.8} />
      Back to overview
    </Link>
  )
}
