import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { verifyAdminFromRequest } from "@/lib/verify-admin-upload"

const f = createUploadthing()

export const uploadRouter = {
  adminImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await verifyAdminFromRequest(req)
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for admin", metadata.userId, file.ufsUrl)
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
