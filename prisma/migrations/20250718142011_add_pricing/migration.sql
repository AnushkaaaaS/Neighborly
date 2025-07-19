/*
  Warnings:

  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "quotedPrice" INTEGER,
ADD COLUMN     "userNotes" TEXT;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "price",
ADD COLUMN     "basePrice" INTEGER,
ADD COLUMN     "isCustomPricing" BOOLEAN NOT NULL DEFAULT false;
