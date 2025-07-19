/*
  Warnings:

  - You are about to drop the column `address` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `documents` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `provider_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "provider_profiles" DROP COLUMN "address",
DROP COLUMN "businessName",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "documents",
DROP COLUMN "isVerified",
DROP COLUMN "rating",
DROP COLUMN "updatedAt",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experience" INTEGER;
