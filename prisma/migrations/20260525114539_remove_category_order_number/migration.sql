/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "categories_orderNumber_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "orderNumber";
