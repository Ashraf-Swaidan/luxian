"use client"

import { Button } from "@/components/ui/button"
import type { PaginationMeta } from "@/lib/types/paginated"
import { cn } from "@/lib/utils"

type ProductsPaginationProps = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
}

export function ProductsPagination({ meta, onPageChange, className }: ProductsPaginationProps) {
  if (meta.totalPages <= 1) {
    return null
  }

  const pages = getPageNumbers(meta.page, meta.totalPages)

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      aria-label="Product pages"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Previous
      </Button>
      {pages.map((page) =>
        page === "…" ? (
          <span key={`ellipsis-${page}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={page}
            type="button"
            variant={page === meta.page ? "default" : "outline"}
            size="sm"
            className="min-w-9"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "…")[] = [1]

  if (current > 3) {
    pages.push("…")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let p = start; p <= end; p++) {
    pages.push(p)
  }

  if (current < total - 2) {
    pages.push("…")
  }

  pages.push(total)
  return pages
}
