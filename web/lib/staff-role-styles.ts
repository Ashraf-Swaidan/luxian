import { cn } from "@/lib/utils"

const rolePalette: Record<
  string,
  { badge: string; avatar: string; dot: string }
> = {
  manager: {
    badge: "bg-[oklch(0.88_0.1_250)] text-neutral-950 ring-[oklch(0.82_0.1_250)]",
    avatar: "bg-[oklch(0.88_0.1_250)] text-neutral-950",
    dot: "bg-[oklch(0.72_0.12_250)]",
  },
  designer: {
    badge: "bg-[oklch(0.92_0.08_330)] text-neutral-950 ring-[oklch(0.86_0.08_330)]",
    avatar: "bg-[oklch(0.92_0.08_330)] text-neutral-950",
    dot: "bg-[oklch(0.78_0.12_330)]",
  },
  "stock-auditor": {
    badge: "bg-[oklch(0.84_0.12_160)] text-neutral-950 ring-[oklch(0.78_0.12_160)]",
    avatar: "bg-[oklch(0.84_0.12_160)] text-neutral-950",
    dot: "bg-[oklch(0.68_0.14_160)]",
  },
}

const fallbackPalette = {
  badge: "bg-neutral-100 text-neutral-900 ring-neutral-200",
  avatar: "bg-neutral-200 text-neutral-900",
  dot: "bg-neutral-400",
}

export function getStaffRoleStyles(slug?: string | null) {
  if (!slug) {
    return fallbackPalette
  }
  return rolePalette[slug] ?? fallbackPalette
}

export function staffRoleBadgeClass(slug?: string | null) {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
    getStaffRoleStyles(slug).badge,
  )
}

export function staffAvatarClass(slug?: string | null) {
  return cn(
    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase",
    getStaffRoleStyles(slug).avatar,
  )
}

export function slugifyRoleName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
