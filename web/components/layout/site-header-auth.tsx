"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardSquare01Icon, ShoppingCart01Icon, UserCircleIcon } from "@hugeicons/core-free-icons"

import { useCartItemCount } from "@/features/cart/hooks"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

type SiteHeaderAuthProps = {
  hero?: boolean
  isAdmin?: boolean
}

export function SiteHeaderAuth({ hero, isAdmin }: SiteHeaderAuthProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const cartCount = useCartItemCount()

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1.5 sm:gap-2", hero ? "text-neutral-950/75" : "text-muted-foreground")}>
        <div className={cn("size-9 animate-pulse rounded-md", hero ? "bg-white/50" : "bg-muted")} />
        <div className={cn("size-9 animate-pulse rounded-md", hero ? "bg-white/50" : "bg-muted")} />
      </div>
    )
  }

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Account navigation">
      {isAdmin && (
        <HeaderIconLink
          href="/admin"
          label="Admin"
          icon={DashboardSquare01Icon}
          active={pathname.startsWith("/admin")}
          hero={hero}
          desktopLabel="Admin"
        />
      )}
      <HeaderIconLink
        href="/cart"
        label="Cart"
        icon={ShoppingCart01Icon}
        active={pathname === "/cart" || pathname.startsWith("/cart/")}
        hero={hero}
        badge={user && cartCount > 0 ? (cartCount > 99 ? "99+" : String(cartCount)) : undefined}
      />
      <HeaderIconLink
        href={user ? "/account/profile" : "/login"}
        label={user ? "Profile" : "Log in"}
        icon={UserCircleIcon}
        active={pathname.startsWith("/account/profile") || pathname === "/login" || pathname === "/register"}
        hero={hero}
      />
    </nav>
  )
}

function HeaderIconLink({
  active,
  badge,
  desktopLabel,
  hero,
  href,
  icon,
  label,
}: {
  active: boolean
  badge?: string
  desktopLabel?: string
  hero?: boolean
  href: string
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "relative flex size-9 items-center justify-center gap-2 rounded-md text-sm transition-colors sm:size-auto sm:px-3 sm:py-2",
        hero
          ? active
            ? "bg-white/70 text-neutral-950"
            : "text-neutral-950/75 hover:bg-white/45 hover:text-neutral-950"
          : active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="size-4" strokeWidth={1.75} />
      {desktopLabel && <span className="hidden md:inline">{desktopLabel}</span>}
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-[var(--luxian-coral)] px-1 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}
