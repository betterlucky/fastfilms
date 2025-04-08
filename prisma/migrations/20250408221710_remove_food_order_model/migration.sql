/*
  Warnings:

  - You are about to drop the column `ticketId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `purchaseId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_ticketId_fkey";

-- Create the Purchase table first
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- Create PurchaseResend table
CREATE TABLE "PurchaseResend" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseResend_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Purchase_campaignId_idx" ON "Purchase"("campaignId");
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX "PurchaseResend_purchaseId_idx" ON "PurchaseResend"("purchaseId");
CREATE INDEX "PurchaseResend_userId_idx" ON "PurchaseResend"("userId");

-- Create purchases for existing tickets
INSERT INTO "Purchase" ("id", "campaignId", "userId", "status", "stripePaymentIntentId", "totalAmount", "createdAt", "updatedAt")
SELECT 
    DISTINCT ON (COALESCE(t."stripePaymentIntentId", t."id"))
    COALESCE(t."stripePaymentIntentId", t."id") as purchase_id,
    t."campaignId",
    t."userId",
    'CONFIRMED',
    t."stripePaymentIntentId",
    SUM(t."pricePaid") OVER (PARTITION BY COALESCE(t."stripePaymentIntentId", t."id")),
    MIN(t."createdAt") OVER (PARTITION BY COALESCE(t."stripePaymentIntentId", t."id")),
    MIN(t."updatedAt") OVER (PARTITION BY COALESCE(t."stripePaymentIntentId", t."id"))
FROM "Ticket" t;

-- Add purchaseId column to Ticket table
ALTER TABLE "Ticket" ADD COLUMN "purchaseId" TEXT;

-- Link existing tickets to their purchases
UPDATE "Ticket"
SET "purchaseId" = COALESCE("stripePaymentIntentId", id)
WHERE "purchaseId" IS NULL;

-- Make purchaseId required
ALTER TABLE "Ticket" ALTER COLUMN "purchaseId" SET NOT NULL;

-- Add purchaseId column to Order table
ALTER TABLE "Order" ADD COLUMN "purchaseId" TEXT;

-- Link existing orders to purchases through their tickets
UPDATE "Order" o
SET "purchaseId" = t."purchaseId"
FROM "Ticket" t
WHERE o."ticketId" = t.id;

-- Make purchaseId required
ALTER TABLE "Order" ALTER COLUMN "purchaseId" SET NOT NULL;

-- Drop the ticketId column from Order
ALTER TABLE "Order" DROP COLUMN "ticketId";

-- Drop the stripePaymentIntentId from Ticket since it's now in Purchase
ALTER TABLE "Ticket" DROP COLUMN "stripePaymentIntentId";

-- Drop the FoodOrder table and its relations if it exists
DROP TABLE IF EXISTS "FoodOrder";

-- Add foreign key constraints
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PurchaseResend" ADD CONSTRAINT "PurchaseResend_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseResend" ADD CONSTRAINT "PurchaseResend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
