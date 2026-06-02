import Link from "next/link"

import { AdminBackLink } from "@/components/admin/admin-back-link"
import { RequireAdmin } from "@/components/auth/require-admin"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/homepage", label: "Homepage" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAdmin>
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <h1 className="text-2xl font-medium tracking-tight">Store management</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <AdminBackLink />
        {children}
      </div>
    </RequireAdmin>
  )
}
