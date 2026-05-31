ALTER TABLE "homepage_settings" ADD COLUMN "pairLeftCollectionId" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "pairRightCollectionId" TEXT;

CREATE INDEX "homepage_settings_pairLeftCollectionId_idx" ON "homepage_settings"("pairLeftCollectionId");
CREATE INDEX "homepage_settings_pairRightCollectionId_idx" ON "homepage_settings"("pairRightCollectionId");

ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_pairLeftCollectionId_fkey" FOREIGN KEY ("pairLeftCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_pairRightCollectionId_fkey" FOREIGN KEY ("pairRightCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
