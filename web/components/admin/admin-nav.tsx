"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { canAccessAdmin, hasPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import type { Permission } from "@/lib/types/auth"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

const adminLinks: Array<{
  href: string
  label: string
  exact?: boolean
  permission: Permission | Permission[]
}> = [
  { href: "/admin", label: "Overview", exact: true, permission: PERMISSIONS.DASHBOARD_READ },
  { href: "/admin/dashboard", label: "Dashboard", permission: PERMISSIONS.DASHBOARD_READ },
  { href: "/admin/categories", label: "Categories", permission: PERMISSIONS.CATALOG_WRITE },
  { href: "/admin/collections", label: "Collections", permission: PERMISSIONS.CATALOG_WRITE },
  { href: "/admin/products", label: "Products", permission: PERMISSIONS.PRODUCTS_READ },
  { href: "/admin/suppliers", label: "Suppliers", permission: PERMISSIONS.SUPPLIERS_READ },
  { href: "/admin/orders", label: "Orders", permission: PERMISSIONS.ORDERS_READ },
  { href: "/admin/homepage", label: "Homepage", permission: PERMISSIONS.HOMEPAGE_WRITE },
  { href: "/admin/staff", label: "Staff", permission: PERMISSIONS.STAFF_MANAGE },
]

export function AdminNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const visibleLinks = adminLinks.filter((link) => {
    if (link.href === "/admin") {
      return canAccessAdmin(user)
    }
    return hasPermission(user, link.permission)
  })

  return (
    <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      {visibleLinks.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
