import { UploadThingError } from "uploadthing/server"

import { canAccessAdmin, hasAnyPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import { ServerApiError, serverApiGet } from "@/lib/server-api"
import type { AuthUser } from "@/lib/types/auth"

export async function verifyAdminFromRequest(req: Request): Promise<AuthUser> {
  const cookie = req.headers.get("cookie")
  if (!cookie) {
    throw new UploadThingError("Unauthorized — sign in to the admin area")
  }

  let user: AuthUser
  try {
    user = await serverApiGet<AuthUser>("auth/me", {
      headers: { cookie },
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 401) {
      throw new UploadThingError("Unauthorized")
    }
    throw error
  }
  if (
    !canAccessAdmin(user) ||
    !hasAnyPermission(user, [PERMISSIONS.MEDIA_WRITE, PERMISSIONS.PRODUCTS_WRITE])
  ) {
    throw new UploadThingError("Forbidden — insufficient permissions")
  }

  return user
}
