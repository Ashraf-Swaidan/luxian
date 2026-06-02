import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

import { HOMEPAGE_CACHE_TAG } from "@/lib/homepage-cache"
import { canAccessAdmin, hasPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import { ServerApiError, serverApiGet } from "@/lib/server-api"
import type { AuthUser } from "@/lib/types/auth"

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie")
  if (!cookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await serverApiGet<AuthUser>("auth/me", {
      headers: { cookie },
      cache: "no-store",
    })

    if (!canAccessAdmin(user) || !hasPermission(user, PERMISSIONS.HOMEPAGE_WRITE)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    revalidateTag(HOMEPAGE_CACHE_TAG, "max")

    return NextResponse.json({ revalidated: true })
  } catch (error) {
    if (error instanceof ServerApiError && (error.statusCode === 401 || error.statusCode === 403)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: error.statusCode })
    }

    console.error(error)
    return NextResponse.json({ message: "Could not refresh public page" }, { status: 500 })
  }
}
