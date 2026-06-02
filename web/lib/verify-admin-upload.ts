import { UploadThingError } from "uploadthing/server"

import { canAccessAdmin, hasAnyPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import type { AuthUser } from "@/lib/types/auth"

export async function verifyAdminFromRequest(req: Request): Promise<AuthUser> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    throw new UploadThingError("Server misconfigured (NEXT_PUBLIC_API_URL)")
  }

  const cookie = req.headers.get("cookie")
  if (!cookie) {
    throw new UploadThingError("Unauthorized — sign in to the admin area")
  }

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new UploadThingError("Unauthorized")
  }

  const user = (await res.json()) as AuthUser
  if (
    !canAccessAdmin(user) ||
    !hasAnyPermission(user, [PERMISSIONS.MEDIA_WRITE, PERMISSIONS.PRODUCTS_WRITE])
  ) {
    throw new UploadThingError("Forbidden — insufficient permissions")
  }

  return user
}
