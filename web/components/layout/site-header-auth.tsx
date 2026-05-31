"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

type SiteHeaderAuthProps = {
  hero?: boolean
}

export function SiteHeaderAuth({ hero }: SiteHeaderAuthProps) {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div
        className={cn(
          "size-9 animate-pulse rounded-md",
          hero ? "bg-white/50" : "bg-muted",
        )}
      />
    )
  }

  if (user) {
    return (
      <button
        type="button"
        title="Log out"
        onClick={() => void logout()}
        className={cn(
          "flex size-9 items-center justify-center rounded-md transition-colors",
          hero
            ? "text-neutral-950/75 hover:bg-white/45 hover:text-neutral-950"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <HugeiconsIcon icon={Logout01Icon} className="size-4" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link
          href="/login"
          className={cn(
            "max-[420px]:px-2 max-[420px]:text-xs",
            hero && "text-neutral-950/75 hover:bg-white/45 hover:text-neutral-950",
          )}
        >
          Log in
        </Link>
      </Button>
      <Link
        href="/register"
        className={cn(
          "luxian-cta luxian-cta-ring hidden h-9 px-4 text-xs sm:inline-flex sm:items-center",
          hero && "bg-neutral-950 text-white hover:brightness-100",
        )}
      >
        Sign up
      </Link>
    </div>
  )
}
