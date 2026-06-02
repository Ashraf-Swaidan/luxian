"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessAdmin, hasPermission } from "@/lib/permissions"
import type { Permission } from "@/lib/types/auth"
import { useAuth } from "@/providers/auth-provider"

export function RequirePermission({
  permission,
  children,
  redirectTo = "/admin",
}: {
  permission: Permission | Permission[]
  children: React.ReactNode
  redirectTo?: string
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`)
      return
    }
    if (!canAccessAdmin(user) || !hasPermission(user, permission)) {
      router.replace("/admin")
    }
  }, [user, isLoading, router, permission, redirectTo])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!user || !canAccessAdmin(user) || !hasPermission(user, permission)) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <p className="text-sm text-muted-foreground">You do not have access to this section.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/admin">Back to admin</Link>
        </Button>
      </main>
    )
  }

  return <>{children}</>
}
