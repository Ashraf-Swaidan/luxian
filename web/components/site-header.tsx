import Link from "next/link"

import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/account/orders", label: "Orders" },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="text-sm font-medium tracking-wide">
          Luxian
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
