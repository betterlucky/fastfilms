-- CreateTable
CREATE TABLE "TicketResend" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketResend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketResend_ticketId_idx" ON "TicketResend"("ticketId");

-- CreateIndex
CREATE INDEX "TicketResend_userId_idx" ON "TicketResend"("userId");

-- AddForeignKey
ALTER TABLE "TicketResend" ADD CONSTRAINT "TicketResend_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResend" ADD CONSTRAINT "TicketResend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
