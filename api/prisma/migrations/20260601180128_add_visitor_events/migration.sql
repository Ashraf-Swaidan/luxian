-- CreateEnum
CREATE TYPE "VisitorEventType" AS ENUM ('SEARCH', 'PRODUCT_CLICK', 'PRODUCT_VIEW', 'CATEGORY_FILTER', 'COLLECTION_FILTER');

-- CreateTable
CREATE TABLE "visitor_events" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "eventType" "VisitorEventType" NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    "collectionId" TEXT,
    "search" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_events_visitorId_createdAt_idx" ON "visitor_events"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "visitor_events_categoryId_idx" ON "visitor_events"("categoryId");

-- CreateIndex
CREATE INDEX "visitor_events_productId_idx" ON "visitor_events"("productId");
