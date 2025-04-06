/*
  Warnings:

  - You are about to alter the column `price` on the `MenuItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `pricePaid` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `transactionFee` on the `Ticket` table. All the data in the column will be lost.
  - You are about to alter the column `pricePaid` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - Added the required column `updatedAt` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choices` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "pricePaid",
DROP COLUMN "quantity",
ADD COLUMN     "choices" JSONB NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "purchaseDate",
DROP COLUMN "transactionFee",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "pricePaid" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "MenuItemOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "choices" TEXT[],
    "menuItemId" TEXT NOT NULL,

    CONSTRAINT "MenuItemOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuItemOption" ADD CONSTRAINT "MenuItemOption_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
