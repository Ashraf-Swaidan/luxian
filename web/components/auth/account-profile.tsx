"use client"

import { Logout01Icon, PackageIcon, ShoppingBag01Icon, ShoppingCart01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { RequireAuth } from "@/components/auth/require-auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/features/cart/hooks"
import { useOrders } from "@/features/orders/hooks"
import { formatCartSubtotal } from "@/lib/cart-utils"
import { useAuth } from "@/providers/auth-provider"

function ProfileContent() {
  const { user, logout } = useAuth()
  const { data: orders, isPending: ordersLoading } = useOrders()
  const { data: cart, isPending: cartLoading } = useCart()

  if (!user) {
    return null
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Luxian member"
  const accountType = user.role === "ADMIN" ? "Store admin" : "Customer"
  const orderCount = orders?.length ?? 0
  const bagCount = cart?.cartItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-h-72 flex-col justify-between bg-neutral-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Your Luxian account</p>
              <h1 className="mt-3 font-display text-6xl leading-none font-bold uppercase sm:text-7xl">{displayName}</h1>
            </div>
            <HugeiconsIcon icon={UserIcon} className="size-8" strokeWidth={1.7} />
          </div>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <p className="max-w-xl text-sm leading-relaxed text-white/70">
              Your profile keeps the essentials in one place: account details, active bag, and the orders you can come
              back to anytime.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void logout()}
              className="w-fit border-white/20 bg-white/10 text-white hover:bg-white hover:text-neutral-950"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" strokeWidth={1.75} />
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <ProfileWidget
            icon={PackageIcon}
            label="Orders"
            loading={ordersLoading}
            value={`${orderCount} order${orderCount === 1 ? "" : "s"}`}
            tone="bg-[oklch(0.91_0.11_185)]"
          />
          <ProfileWidget
            icon={ShoppingCart01Icon}
            label="In your bag"
            loading={cartLoading}
            value={`${bagCount} item${bagCount === 1 ? "" : "s"}`}
            tone="bg-[oklch(0.9_0.12_86)]"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="bg-white p-6 ring-1 ring-border/50">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Account details</p>
              <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">Profile</h2>
            </div>
            <HugeiconsIcon icon={UserIcon} className="size-7 text-neutral-950" strokeWidth={1.7} />
          </div>

          <dl className="divide-y divide-border/60">
            <ProfileDetail label="Name" value={displayName} />
            <ProfileDetail label="Email" value={user.email} />
            <ProfileDetail label="Account type" value={accountType} />
          </dl>
        </div>

        <aside className="space-y-3 bg-[oklch(0.94_0.04_95)] p-5 text-neutral-950">
          <HugeiconsIcon icon={ShoppingBag01Icon} className="size-7" strokeWidth={1.7} />
          <div>
            <p className="text-xs font-medium tracking-wide uppercase opacity-70">Quick moves</p>
            <h2 className="mt-1 font-display text-4xl leading-none font-bold uppercase">What next?</h2>
          </div>
          <div className="grid gap-2 pt-2">
            <Button asChild className="justify-start">
              <Link href="/account/orders">View orders</Link>
            </Button>
            <Button variant="outline" asChild className="justify-start bg-white">
              <Link href="/products">Continue shopping</Link>
            </Button>
            <Button variant="outline" asChild className="justify-start bg-white">
              <Link href="/cart">Your bag</Link>
            </Button>
          </div>
          <p className="pt-2 text-sm leading-relaxed opacity-70">
            Current bag value: {cartLoading ? "Loading..." : formatCartSubtotal(cart)}
          </p>
        </aside>
      </section>
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

function ProfileWidget({
  icon,
  label,
  loading,
  tone,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  loading: boolean
  tone: string
  value: string
}) {
  return (
    <div className={`${tone} flex min-h-32 flex-col justify-between p-4 text-neutral-950`}>
      <HugeiconsIcon icon={icon} className="size-7" strokeWidth={1.7} />
      <div>
        <p className="text-xs font-medium tracking-wide uppercase opacity-70">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-28 bg-white/50" />
        ) : (
          <p className="mt-1 font-display text-3xl leading-none font-bold uppercase">{value}</p>
        )}
      </div>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-neutral-950">{value}</dd>
    </div>
  )
}
