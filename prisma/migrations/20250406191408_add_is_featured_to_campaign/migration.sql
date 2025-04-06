/*
  Warnings:

  - You are about to drop the column `customBlurb` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `tmdbId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to alter the column `fundingTarget` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `currentFunding` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "customBlurb",
DROP COLUMN "tmdbId",
ADD COLUMN     "charityId" TEXT,
ALTER COLUMN "ticketCap" DROP DEFAULT,
ALTER COLUMN "fundingTarget" DROP DEFAULT,
ALTER COLUMN "fundingTarget" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "currentFunding" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "screeningTime" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoPath" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
