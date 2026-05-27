"use client"

import Link from "next/link"

import { useCartItemCount } from "@/features/cart/hooks"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart", showBadge: true },
  { href: "/account/orders", label: "Orders" },
]

export function SiteHeaderNav() {
  const { user } = useAuth()
  const cartCount = useCartItemCount()

  return (
    <nav className="hidden items-center gap-6 sm:flex">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "relative text-sm text-muted-foreground transition-colors hover:text-foreground",
          )}
        >
          {link.label}
          {link.showBadge && user && cartCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}
