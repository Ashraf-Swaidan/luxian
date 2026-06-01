import { NextResponse } from "next/server"
import { UTApi } from "uploadthing/server"

import { verifyAdminFromRequest } from "@/lib/verify-admin-upload"

export async function POST(request: Request) {
  try {
    await verifyAdminFromRequest(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized"
    const status = message.includes("Forbidden") ? 403 : 401
    return NextResponse.json({ message }, { status })
  }

  let body: { key?: string }
  try {
    body = (await request.json()) as { key?: string }
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.key?.trim()) {
    return NextResponse.json({ message: "key is required" }, { status: 400 })
  }

  try {
    await new UTApi().deleteFiles([body.key.trim()])
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Could not delete file from storage" }, { status: 500 })
  }
}
