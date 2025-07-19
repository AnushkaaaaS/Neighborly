/*
  Warnings:

  - The values [ELECTRICIAN,PLUMBER,CLEANER,MOVER,PAINTER] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('COOKING_HELP', 'TUTORING', 'RIDES_AND_ERRANDS', 'CREATIVE_HELP', 'HOME_REPAIRS', 'CLEANING', 'PET_CARE', 'MOVING_HELP', 'OTHER');
ALTER TABLE "provider_profiles" ALTER COLUMN "serviceTypes" TYPE "ServiceType_new"[] USING ("serviceTypes"::text::"ServiceType_new"[]);
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
COMMIT;
