/** Accent colors aligned with /admin overview cards. */
export const adminSectionStyles = {
  categories: {
    card: "bg-[oklch(0.8_0.16_82)]",
    button:
      "border-transparent bg-[oklch(0.8_0.16_82)] text-neutral-950 hover:bg-[oklch(0.76_0.16_82)]",
  },
  products: {
    card: "bg-[oklch(0.72_0.14_195)]",
    button:
      "border-transparent bg-[oklch(0.72_0.14_195)] text-neutral-950 hover:bg-[oklch(0.68_0.14_195)]",
  },
  collections: {
    card: "bg-[oklch(0.9_0.12_86)]",
    button:
      "border-transparent bg-[oklch(0.9_0.12_86)] text-neutral-950 hover:bg-[oklch(0.86_0.12_86)]",
  },
  homepage: {
    card: "bg-[oklch(0.92_0.08_330)]",
    button:
      "border-transparent bg-[oklch(0.92_0.08_330)] text-neutral-950 hover:bg-[oklch(0.88_0.08_330)]",
  },
  suppliers: {
    card: "bg-[oklch(0.84_0.12_160)]",
    button:
      "border-transparent bg-[oklch(0.84_0.12_160)] text-neutral-950 hover:bg-[oklch(0.8_0.12_160)]",
  },
  orders: {
    card: "bg-[oklch(0.78_0.13_25)]",
    button:
      "border-transparent bg-[oklch(0.78_0.13_25)] text-neutral-950 hover:bg-[oklch(0.74_0.13_25)]",
  },
  dashboard: {
    card: "bg-[oklch(0.88_0.1_250)]",
    button:
      "border-transparent bg-[oklch(0.88_0.1_250)] text-neutral-950 hover:bg-[oklch(0.84_0.1_250)]",
  },
  staff: {
    card: "bg-[oklch(0.9_0.11_280)]",
    button:
      "border-transparent bg-[oklch(0.9_0.11_280)] text-neutral-950 hover:bg-[oklch(0.86_0.11_280)]",
  },
} as const

export type AdminSectionKey = keyof typeof adminSectionStyles

export function adminPrimaryButtonClass(section: AdminSectionKey) {
  return adminSectionStyles[section].button
}

export function getAdminSectionFromPath(pathname: string): AdminSectionKey | null {
  if (pathname.startsWith("/admin/suppliers")) return "suppliers"
  if (pathname.startsWith("/admin/products")) return "products"
  if (pathname.startsWith("/admin/collections")) return "collections"
  if (pathname.startsWith("/admin/categories")) return "categories"
  if (pathname.startsWith("/admin/homepage")) return "homepage"
  if (pathname.startsWith("/admin/orders")) return "orders"
  if (pathname.startsWith("/admin/dashboard")) return "dashboard"
  if (pathname.startsWith("/admin/staff")) return "staff"
  return null
}
