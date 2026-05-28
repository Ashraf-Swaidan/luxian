"use client"

import Link from "next/link"

import { RequireAuth } from "@/components/require-auth"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"

function ProfileContent() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Not set"

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-tight">Your profile</h1>
        <p className="text-sm text-muted-foreground">
          Account details from your Luxian sign-in. More settings will arrive soon.
        </p>
      </div>

      <dl className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-4">
          <dt className="text-sm text-muted-foreground">Name</dt>
          <dd className="text-sm font-medium">{displayName}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-4">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="text-sm font-medium">{user.email}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-4">
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="text-sm font-medium capitalize">{user.role.toLowerCase()}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/account/orders">View orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/cart">Your bag</Link>
        </Button>
      </div>
    </div>
  )
}

export function AccountProfile() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}
