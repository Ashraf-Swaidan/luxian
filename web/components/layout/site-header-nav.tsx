"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Home01Icon, ShoppingBag01Icon, PackageIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", icon: Home01Icon },
  { href: "/products", label: "Shop", icon: ShoppingBag01Icon },
  { href: "/account/orders", label: "Orders", icon: PackageIcon },
]

type SiteHeaderNavProps = {
  hero?: boolean
}

export function SiteHeaderNav({ hero }: SiteHeaderNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-0.5 sm:gap-2">
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
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
            <HugeiconsIcon icon={link.icon} className="size-4" strokeWidth={1.75} />
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
