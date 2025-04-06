/*
  Warnings:

  - You are about to drop the column `type` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `choices` on the `MenuItemOption` table. All the data in the column will be lost.
  - You are about to drop the column `required` on the `MenuItemOption` table. All the data in the column will be lost.
  - You are about to drop the column `choices` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - Made the column `description` on table `MenuItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price` to the `MenuItemOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "type",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "MenuItemOption" DROP COLUMN "choices",
DROP COLUMN "required",
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "choices",
DROP COLUMN "status",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_CampaignToMenuItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CampaignToMenuItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CampaignToMenuItem_B_index" ON "_CampaignToMenuItem"("B");

-- AddForeignKey
ALTER TABLE "_CampaignToMenuItem" ADD CONSTRAINT "_CampaignToMenuItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToMenuItem" ADD CONSTRAINT "_CampaignToMenuItem_B_fkey" FOREIGN KEY ("B") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
