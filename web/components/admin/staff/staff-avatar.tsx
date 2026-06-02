import { staffAvatarClass } from "@/lib/staff-role-styles"
import { cn } from "@/lib/utils"

type StaffAvatarProps = {
  firstName?: string | null
  lastName?: string | null
  email: string
  roleSlug?: string | null
  className?: string
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  if (first || last) {
    return `${first}${last}`.toUpperCase()
  }
  return (email?.charAt(0) ?? "?").toUpperCase()
}

export function StaffAvatar({ firstName, lastName, email, roleSlug, className }: StaffAvatarProps) {
  return (
    <div className={cn(staffAvatarClass(roleSlug), className)} aria-hidden>
      {getInitials(firstName, lastName, email)}
    </div>
  )
}
