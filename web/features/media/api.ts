import { api } from "@/lib/api-client"
import type { DeleteMediaAssetResponse, MediaAsset, MediaOwnerType } from "@/lib/types/media"

export type ImageHistoryParams = {
  ownerType: MediaOwnerType
  ownerId: string
  slot?: string
}

export function getImageHistory({ ownerType, ownerId, slot = "image" }: ImageHistoryParams) {
  const query = new URLSearchParams({
    ownerType,
    ownerId,
    slot,
  })

  return api.get<MediaAsset[]>(`media/history?${query}`)
}

export function deleteImageAsset(id: string) {
  return api.delete<DeleteMediaAssetResponse>(`media/${id}`)
}

export async function deleteStorageObject(key: string) {
  const response = await fetch("/api/uploadthing/delete", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? "Could not delete file from storage")
  }

  return response.json() as Promise<{ deleted: true }>
}
