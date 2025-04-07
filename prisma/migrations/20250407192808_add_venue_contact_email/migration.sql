-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'FAILED');

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "contactEmail" TEXT;
