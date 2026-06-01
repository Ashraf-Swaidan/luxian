CREATE TYPE "MediaOwnerType" AS ENUM ('PRODUCT', 'CATEGORY', 'COLLECTION', 'HOMEPAGE');

CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "ownerType" "MediaOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "slot" TEXT NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "key" TEXT,
    "uploadedById" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_assets_ownerType_ownerId_slot_idx" ON "media_assets"("ownerType", "ownerId", "slot");
