/*
  Warnings:

  - You are about to drop the column `price` on the `MenuItemOption` table. All the data in the column will be lost.
  - Added the required column `category` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MenuItemOption" DROP COLUMN "price",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxChoices" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minChoices" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "MenuItemOptionChoice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItemOptionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderChoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "selectedChoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderChoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuItemOptionChoice" ADD CONSTRAINT "MenuItemOptionChoice_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "MenuItemOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderChoice" ADD CONSTRAINT "OrderChoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderChoice" ADD CONSTRAINT "OrderChoice_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "MenuItemOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderChoice" ADD CONSTRAINT "OrderChoice_selectedChoiceId_fkey" FOREIGN KEY ("selectedChoiceId") REFERENCES "MenuItemOptionChoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
