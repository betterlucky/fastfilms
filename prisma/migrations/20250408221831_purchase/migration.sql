-- CreateIndex
CREATE INDEX "Order_purchaseId_idx" ON "Order"("purchaseId");

-- CreateIndex
CREATE INDEX "Ticket_purchaseId_idx" ON "Ticket"("purchaseId");

-- CreateIndex
CREATE INDEX "Ticket_campaignId_idx" ON "Ticket"("campaignId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");
