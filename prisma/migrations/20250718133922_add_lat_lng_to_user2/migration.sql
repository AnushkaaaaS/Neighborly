/*
  Warnings:

  - You are about to drop the column `lat` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "lat",
DROP COLUMN "lng";
