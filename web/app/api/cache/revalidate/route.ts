import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

import { HOMEPAGE_CACHE_TAG } from "@/lib/homepage-cache"
import { ServerApiError, serverApiGet } from "@/lib/server-api"
import type { AuthUser } from "@/lib/types/auth"

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await serverApiGet<AuthUser>("auth/me", {
      headers: { Authorization: authorization },
      cache: "no-store",
    })

    if (user.role !== "ADMIN") {
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
