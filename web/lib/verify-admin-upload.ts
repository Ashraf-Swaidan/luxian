import { UploadThingError } from "uploadthing/server"

import type { AuthUser } from "@/lib/types/auth"

export async function verifyAdminFromRequest(req: Request): Promise<AuthUser> {
  const authorization = req.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    throw new UploadThingError("Unauthorized — sign in as admin")
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    throw new UploadThingError("Server misconfigured (NEXT_PUBLIC_API_URL)")
  }

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/me`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new UploadThingError("Unauthorized")
  }

  const user = (await res.json()) as AuthUser
  if (user.role !== "ADMIN") {
    throw new UploadThingError("Forbidden — admin only")
  }

  return user
}
