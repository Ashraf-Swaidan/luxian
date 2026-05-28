"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  UserIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons"

import { useCartItemCount } from "@/features/cart/hooks"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

const links = [
  { href: "/products", label: "Shop", icon: ShoppingBag01Icon },
  { href: "/cart", label: "Bag", icon: ShoppingCart01Icon, badge: true },
  { href: "/account/orders", label: "Orders", icon: PackageIcon },
]

export function SiteHeaderNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const cartCount = useCartItemCount()

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <HugeiconsIcon icon={link.icon} className="size-4" strokeWidth={1.75} />
            <span className="hidden md:inline">{link.label}</span>
            {link.badge && user && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--luxian-coral)] px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        )
      })}

      {user && (
        <Link
          href="/account/profile"
          title="Profile"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/account/profile")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <HugeiconsIcon icon={UserIcon} className="size-4" strokeWidth={1.75} />
          <span className="hidden md:inline">Profile</span>
        </Link>
      )}

      {user?.role === "ADMIN" && (
        <Link
          href="/admin"
          className={cn(
            "hidden rounded-lg px-3 py-2 text-sm transition-colors sm:flex",
            pathname.startsWith("/admin")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          Admin
        </Link>
      )}
    </nav>
  )
}
