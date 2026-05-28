import Link from "next/link"

import { LuxianLogo } from "@/components/layout/luxian-logo"
import { StoreShell } from "@/components/layout/store-shell"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/20">
      <StoreShell className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <LuxianLogo size="sm" showWordmark />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Bag
          </Link>
          <Link href="/account/profile" className="hover:text-foreground">
            Profile
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Luxian</p>
      </StoreShell>
    </footer>
  )
}
