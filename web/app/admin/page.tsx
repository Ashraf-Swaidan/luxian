import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, Home11Icon, PackageIcon, PackageOpenIcon } from "@hugeicons/core-free-icons"

const adminCards = [
  {
    href: "/admin/categories",
    title: "Categories",
    icon: Folder01Icon,
    color: "bg-[oklch(0.8_0.16_82)]",
  },
  {
    href: "/admin/products",
    title: "Products",
    icon: PackageIcon,
    color: "bg-[oklch(0.72_0.14_195)]",
  },
  {
    href: "/admin/collections",
    title: "Collections",
    icon: PackageOpenIcon,
    color: "bg-[oklch(0.9_0.12_86)]",
  },
  {
    href: "/admin/homepage",
    title: "Homepage",
    icon: Home11Icon,
    color: "bg-[oklch(0.92_0.08_330)]",
  },
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
            className={`flex size-20 shrink-0 items-center justify-center text-neutral-950 md:size-24 ${card.color}`}
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
