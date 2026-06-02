import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, Home11Icon, PackageAddIcon, PackageIcon, PackageOpenIcon } from "@hugeicons/core-free-icons"

import { adminSectionStyles, type AdminSectionKey } from "@/lib/admin-section-colors"

const adminCards: Array<{
  href: string
  title: string
  icon: typeof Folder01Icon
  section: AdminSectionKey
}> = [
  { href: "/admin/categories", title: "Categories", icon: Folder01Icon, section: "categories" },
  { href: "/admin/products", title: "Products", icon: PackageIcon, section: "products" },
  { href: "/admin/collections", title: "Collections", icon: PackageOpenIcon, section: "collections" },
  { href: "/admin/homepage", title: "Homepage", icon: Home11Icon, section: "homepage" },
  { href: "/admin/suppliers", title: "Suppliers", icon: PackageAddIcon, section: "suppliers" },
  { href: "/admin/orders", title: "Orders", icon: PackageOpenIcon, section: "orders" },
]

export default function AdminPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
      {adminCards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex min-h-56 flex-col justify-between gap-8 bg-white p-8 ring-1 ring-border/60 transition-colors hover:bg-neutral-100 md:min-h-72 md:p-10 lg:min-h-80"
        >
          <div
            className={`flex size-20 shrink-0 items-center justify-center text-neutral-950 md:size-24 ${adminSectionStyles[card.section].card}`}
          >
            <HugeiconsIcon icon={card.icon} className="size-10 md:size-12" strokeWidth={1.7} />
          </div>
          <h2 className="font-display text-4xl font-bold uppercase leading-tight text-neutral-950 md:text-5xl lg:text-6xl">
            {card.title}
          </h2>
        </Link>
      ))}
    </div>
  )
}
