export type MediaOwnerType = "PRODUCT" | "CATEGORY" | "COLLECTION" | "HOMEPAGE"

export type MediaAsset = {
  id: string
  ownerType: MediaOwnerType
  ownerId: string
  slot: string
  url: string
  key: string | null
  uploadedById: string | null
  isCurrent: boolean
  deletedAt: string | null
  createdAt: string
}

export type DeleteMediaAssetResponse = {
  id: string
  key: string | null
}
