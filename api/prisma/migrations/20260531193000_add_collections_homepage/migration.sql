-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_products" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_settings" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "latestCollectionId" TEXT,
    "trendingCollectionId" TEXT,
    "bannerCollectionId" TEXT,
    "bannerImageUrl" TEXT,
    "bannerButtonText" TEXT NOT NULL DEFAULT 'See Collection',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_slug_idx" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_isActive_idx" ON "collections"("isActive");

-- CreateIndex
CREATE INDEX "collection_products_collectionId_idx" ON "collection_products"("collectionId");

-- CreateIndex
CREATE INDEX "collection_products_productId_idx" ON "collection_products"("productId");

-- CreateIndex
CREATE INDEX "collection_products_collectionId_position_idx" ON "collection_products"("collectionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "collection_products_collectionId_productId_key" ON "collection_products"("collectionId", "productId");

-- CreateIndex
CREATE INDEX "homepage_settings_latestCollectionId_idx" ON "homepage_settings"("latestCollectionId");

-- CreateIndex
CREATE INDEX "homepage_settings_trendingCollectionId_idx" ON "homepage_settings"("trendingCollectionId");

-- CreateIndex
CREATE INDEX "homepage_settings_bannerCollectionId_idx" ON "homepage_settings"("bannerCollectionId");

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_latestCollectionId_fkey" FOREIGN KEY ("latestCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_trendingCollectionId_fkey" FOREIGN KEY ("trendingCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_bannerCollectionId_fkey" FOREIGN KEY ("bannerCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
