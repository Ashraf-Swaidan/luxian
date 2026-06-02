"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics01Icon,
  Folder01Icon,
  Home11Icon,
  PackageAddIcon,
  PackageIcon,
  PackageOpenIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { adminSectionStyles, type AdminSectionKey } from "@/lib/admin-section-colors"
import { hasPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import type { Permission } from "@/lib/types/auth"
import { useAuth } from "@/providers/auth-provider"

const adminCards: Array<{
  href: string
  title: string
  icon: typeof Folder01Icon
  section: AdminSectionKey
  permission: Permission | Permission[]
}> = [
  {
    href: "/admin/dashboard",
    title: "Dashboard",
    icon: Analytics01Icon,
    section: "dashboard",
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    href: "/admin/categories",
    title: "Categories",
    icon: Folder01Icon,
    section: "categories",
    permission: PERMISSIONS.CATALOG_WRITE,
  },
  {
    href: "/admin/products",
    title: "Products",
    icon: PackageIcon,
    section: "products",
    permission: PERMISSIONS.PRODUCTS_READ,
  },
  {
    href: "/admin/collections",
    title: "Collections",
    icon: PackageOpenIcon,
    section: "collections",
    permission: PERMISSIONS.CATALOG_WRITE,
  },
  {
    href: "/admin/homepage",
    title: "Homepage",
    icon: Home11Icon,
    section: "homepage",
    permission: PERMISSIONS.HOMEPAGE_WRITE,
  },
  {
    href: "/admin/suppliers",
    title: "Suppliers",
    icon: PackageAddIcon,
    section: "suppliers",
    permission: PERMISSIONS.SUPPLIERS_READ,
  },
  {
    href: "/admin/orders",
    title: "Orders",
    icon: PackageOpenIcon,
    section: "orders",
    permission: PERMISSIONS.ORDERS_READ,
  },
  {
    href: "/admin/staff",
    title: "Staff",
    icon: UserGroupIcon,
    section: "dashboard",
    permission: PERMISSIONS.STAFF_MANAGE,
  },
]

export default function AdminPage() {
  const { user } = useAuth()
  const visibleCards = adminCards.filter((card) => hasPermission(user, card.permission))

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {visibleCards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex min-h-36 flex-col justify-between gap-4 bg-white p-5 ring-1 ring-border/60 transition-colors hover:bg-neutral-100 sm:min-h-40 sm:p-6"
        >
          <div
            className={`flex size-12 shrink-0 items-center justify-center text-neutral-950 sm:size-14 ${adminSectionStyles[card.section].card}`}
          >
            <HugeiconsIcon icon={card.icon} className="size-6 sm:size-7" strokeWidth={1.7} />
          </div>
          <h2 className="font-display text-xl font-bold uppercase leading-tight text-neutral-950 sm:text-2xl">
            {card.title}
          </h2>
        </Link>
      ))}
    </div>
  )
}
