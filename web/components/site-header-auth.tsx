"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"

export function SiteHeaderAuth() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void logout()
          }}
        >
          Log out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Log in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Sign up</Link>
      </Button>
    </div>
  )
}
