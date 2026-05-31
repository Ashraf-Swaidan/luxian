import Link from "next/link"

const footerGroups = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "Products" },
      { href: "/cart", label: "Cart" },
      { href: "/", label: "Latest Collection" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/account/orders", label: "Orders" },
      { href: "/account/profile", label: "Profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Campaign" },
      { href: "/", label: "Gallery" },
      { href: "/", label: "About" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/", label: "Contact" },
      { href: "/", label: "Shipping" },
      { href: "/", label: "Returns" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-white">
      <div className="mx-auto w-full max-w-[112rem] px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-6">
            <Link
              href="/"
              className="block font-display text-[19vw] font-bold uppercase leading-none tracking-normal text-neutral-950 sm:text-[16vw] lg:text-[9rem]"
            >
              LUXIAN
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 sm:text-base">
              Technical silhouettes for city movement.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:pt-5">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-950">
                  {group.title}
                </h2>
                <ul className="space-y-3 text-sm text-neutral-500">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link href={link.href} className="transition-colors hover:text-neutral-950">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs uppercase tracking-wide text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Luxian</p>
          <p>Built for motion</p>
          <div className="flex gap-5">
            <Link href="/" className="transition-colors hover:text-neutral-950">
              Instagram
            </Link>
            <Link href="/" className="transition-colors hover:text-neutral-950">
              TikTok
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
