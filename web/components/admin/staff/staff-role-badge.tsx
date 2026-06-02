import { staffRoleBadgeClass } from "@/lib/staff-role-styles"
import { cn } from "@/lib/utils"

export function StaffRoleBadge({
  name,
  slug,
  className,
}: {
  name: string
  slug?: string | null
  className?: string
}) {
  return <span className={cn(staffRoleBadgeClass(slug), className)}>{name}</span>
}
