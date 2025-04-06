/*
  Warnings:

  - You are about to drop the `_CampaignToMenuItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CampaignToMenuItem" DROP CONSTRAINT "_CampaignToMenuItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_CampaignToMenuItem" DROP CONSTRAINT "_CampaignToMenuItem_B_fkey";

-- DropTable
DROP TABLE "_CampaignToMenuItem";

-- CreateTable
CREATE TABLE "CampaignMenuItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMenuItem_campaignId_menuItemId_key" ON "CampaignMenuItem"("campaignId", "menuItemId");

-- AddForeignKey
ALTER TABLE "CampaignMenuItem" ADD CONSTRAINT "CampaignMenuItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMenuItem" ADD CONSTRAINT "CampaignMenuItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
