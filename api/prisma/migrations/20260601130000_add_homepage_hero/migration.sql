ALTER TABLE "homepage_settings" ADD COLUMN "heroCollectionId" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "heroWordmark" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "heroEyebrow" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "heroHeading" TEXT;
ALTER TABLE "homepage_settings" ADD COLUMN "heroTagline" TEXT;

CREATE INDEX "homepage_settings_heroCollectionId_idx" ON "homepage_settings"("heroCollectionId");

ALTER TABLE "homepage_settings" ADD CONSTRAINT "homepage_settings_heroCollectionId_fkey" FOREIGN KEY ("heroCollectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
