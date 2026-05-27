"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"

export function SiteHeaderAuth() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="size-9 animate-pulse rounded-lg bg-muted" />
  }

  if (user) {
    return (
      <button
        type="button"
        title="Log out"
        onClick={() => void logout()}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Log in</Link>
      </Button>
      <Link href="/register" className="luxian-cta luxian-cta-ring hidden h-9 px-4 text-xs sm:inline-flex sm:items-center">
        Sign up
      </Link>
    </div>
  )
}
