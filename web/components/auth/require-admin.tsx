"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessAdmin } from "@/lib/permissions"
import { useAuth } from "@/providers/auth-provider"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login?redirect=/admin")
      return
    }
    if (!canAccessAdmin(user)) {
      router.replace("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    )
  }

  if (!user || !canAccessAdmin(user)) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Admin access required.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/">Back to store</Link>
        </Button>
      </main>
    )
  }

  return <>{children}</>
}
