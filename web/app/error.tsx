"use client"

import { useEffect } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { getFriendlyErrorMessage } from "@/lib/error-message"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 items-center bg-background px-6 py-20 sm:px-10 lg:px-14">
      <section className="mx-auto w-full max-w-[72rem]">
        <div className="space-y-7">
          <div className="inline-flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Alert02Icon} className="size-6" strokeWidth={2} aria-hidden />
          </div>
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Please try again</p>
            <h1 className="font-display text-5xl leading-none font-bold tracking-normal text-foreground uppercase sm:text-7xl">
              Store unavailable
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {getFriendlyErrorMessage(error)}
            </p>
            {process.env.NODE_ENV !== "production" && error.message && (
              <p className="font-mono text-xs break-words text-muted-foreground/80">{error.message}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>
              <HugeiconsIcon icon={RefreshIcon} className="size-4" strokeWidth={2} aria-hidden />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
