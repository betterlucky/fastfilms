/*
  Warnings:

  - The values [FAILED] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `screeningTime` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampaignStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
ALTER TYPE "CampaignStatus_new" RENAME TO "CampaignStatus";
DROP TYPE "CampaignStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'VENUE_ADMIN';

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "screeningTime";
