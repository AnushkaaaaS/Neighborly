/*
  Warnings:

  - Added the required column `address` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "address" TEXT NOT NULL;
