/*
  Warnings:

  - You are about to drop the column `selectedChoiceId` on the `OrderChoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderChoice" DROP CONSTRAINT "OrderChoice_selectedChoiceId_fkey";

-- AlterTable
ALTER TABLE "OrderChoice" DROP COLUMN "selectedChoiceId";

-- CreateTable
CREATE TABLE "_OrderChoiceToMenuItemOptionChoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderChoiceToMenuItemOptionChoice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderChoiceToMenuItemOptionChoice_B_index" ON "_OrderChoiceToMenuItemOptionChoice"("B");

-- CreateIndex
CREATE INDEX "OrderChoice_orderId_idx" ON "OrderChoice"("orderId");

-- CreateIndex
CREATE INDEX "OrderChoice_optionId_idx" ON "OrderChoice"("optionId");

-- AddForeignKey
ALTER TABLE "_OrderChoiceToMenuItemOptionChoice" ADD CONSTRAINT "_OrderChoiceToMenuItemOptionChoice_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItemOptionChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderChoiceToMenuItemOptionChoice" ADD CONSTRAINT "_OrderChoiceToMenuItemOptionChoice_B_fkey" FOREIGN KEY ("B") REFERENCES "OrderChoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
