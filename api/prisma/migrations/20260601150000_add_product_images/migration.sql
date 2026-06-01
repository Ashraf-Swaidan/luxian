CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_images_productId_position_idx" ON "product_images"("productId", "position");

ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "product_images" ("id", "productId", "url", "key", "position", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    "imageUrl",
    (regexp_match("imageUrl", '/f/([^/]+)'))[1],
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "products"
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';
