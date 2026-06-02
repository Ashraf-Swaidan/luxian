import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics01Icon,
  Folder01Icon,
  Home11Icon,
  PackageAddIcon,
  PackageIcon,
  PackageOpenIcon,
} from "@hugeicons/core-free-icons"

import { adminSectionStyles, type AdminSectionKey } from "@/lib/admin-section-colors"

const adminCards: Array<{
  href: string
  title: string
  icon: typeof Folder01Icon
  section: AdminSectionKey
}> = [
  { href: "/admin/dashboard", title: "Dashboard", icon: Analytics01Icon, section: "dashboard" },
  { href: "/admin/categories", title: "Categories", icon: Folder01Icon, section: "categories" },
  { href: "/admin/products", title: "Products", icon: PackageIcon, section: "products" },
  { href: "/admin/collections", title: "Collections", icon: PackageOpenIcon, section: "collections" },
  { href: "/admin/homepage", title: "Homepage", icon: Home11Icon, section: "homepage" },
  { href: "/admin/suppliers", title: "Suppliers", icon: PackageAddIcon, section: "suppliers" },
  { href: "/admin/orders", title: "Orders", icon: PackageOpenIcon, section: "orders" },
]

export default function AdminPage() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {adminCards.map((card) => (
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
