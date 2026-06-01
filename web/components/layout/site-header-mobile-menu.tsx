"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  DashboardSquare01Icon,
  Home01Icon,
  Logout01Icon,
  Menu02Icon,
  PackageIcon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCartItemCount } from "@/features/cart/hooks"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

type SiteHeaderMobileMenuProps = {
  hero?: boolean
  isAdmin?: boolean
}

export function SiteHeaderMobileMenu({ hero, isAdmin }: SiteHeaderMobileMenuProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const cartCount = useCartItemCount()
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email : ""
  const initials = user
    ? [user.firstName, user.lastName]
        .filter((part): part is string => Boolean(part))
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || user.email.charAt(0).toUpperCase()
    : ""
  const links = [
    { href: "/", label: "Home", icon: Home01Icon },
    { href: "/products", label: "Shop", icon: ShoppingBag01Icon },
    { href: "/account/orders", label: "Orders", icon: PackageIcon },
    { href: "/cart", label: "Cart", icon: ShoppingCart01Icon, badge: user && cartCount > 0 ? cartCount : undefined },
    { href: user ? "/account/profile" : "/login", label: user ? "Profile" : "Log in", icon: UserCircleIcon },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: DashboardSquare01Icon }] : []),
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex size-10 items-center justify-center rounded-md transition-colors md:hidden",
            hero
              ? "text-neutral-950/80 hover:bg-white/45 hover:text-neutral-950"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
          aria-label="Open menu"
        >
          <HugeiconsIcon icon={Menu02Icon} className="size-5" strokeWidth={1.8} />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[min(90vw,24rem)] px-10 py-9">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/luxian-logo.png" alt="" width={38} height={38} className="size-9 shrink-0" aria-hidden />
            <SheetTitle className="font-display text-3xl leading-none font-bold text-foreground uppercase">
              LUXIAN
            </SheetTitle>
          </div>
          <SheetClose asChild>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" strokeWidth={1.8} />
            </button>
          </SheetClose>
        </div>

        <nav className="mt-14 grid gap-3" aria-label="Mobile navigation">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`)
            const accent =
              link.href === "/cart" || link.href === "/admin" ? "var(--luxian-coral)" : "var(--luxian-teal)"
            return (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "relative flex min-h-12 items-center justify-between gap-4 rounded-md py-1 pr-1 pl-5 font-display text-2xl leading-none font-bold uppercase transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 opacity-0 transition-opacity data-[active=true]:opacity-100"
                    data-active={active}
                    style={{ backgroundColor: accent }}
                    aria-hidden
                  />
                  <span className="flex min-w-0 items-center gap-3">
                    <HugeiconsIcon icon={link.icon} className="size-5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{link.label}</span>
                  </span>
                  {link.badge ? (
                    <span className="ml-2 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[var(--luxian-coral)] px-1.5 font-sans text-xs font-semibold text-white shadow-sm">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  ) : null}
                </Link>
              </SheetClose>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border/70 pt-6">
          {user ? (
            <div className="flex items-center justify-between gap-4">
              <Link href="/account/profile" className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-950 font-medium text-white">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
              </Link>
              <SheetClose asChild>
                <button
                  type="button"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => void logout()}
                  aria-label="Log out"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="size-5" strokeWidth={1.8} />
                </button>
              </SheetClose>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              LUXIAN pieces, orders, and account access are all one tap away.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
