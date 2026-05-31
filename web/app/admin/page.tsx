import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon, PackageIcon } from "@hugeicons/core-free-icons"

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
]

export default function AdminPage() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {adminCards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex min-h-72 flex-col justify-between bg-white p-8 ring-1 ring-border/60 transition-colors hover:bg-neutral-100"
        >
          <div
            className={`flex size-20 items-center justify-center text-neutral-950 ${card.color}`}
          >
            <HugeiconsIcon icon={card.icon} className="size-10" strokeWidth={1.7} />
          </div>
          <h2 className="font-display text-5xl font-bold uppercase leading-none text-neutral-950 sm:text-6xl">
            {card.title}
          </h2>
        </Link>
      ))}
    </div>
  )
}
