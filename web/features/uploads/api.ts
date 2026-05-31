import { api, type UploadImageResponse } from "@/lib/api-client"

export type UploadFolder = "products" | "categories" | "collections" | "banners" | "brand-assets" | "uploads"

export function uploadImage(file: File, folder: UploadFolder = "uploads") {
  const formData = new FormData()
  formData.append("file", file)
  const query = new URLSearchParams({ folder })
  return api.upload<UploadImageResponse>(`uploads/image?${query}`, formData)
}
