/*
  Warnings:

  - The `contactEmail` column on the `Venue` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Venue" DROP COLUMN "contactEmail",
ADD COLUMN     "contactEmail" TEXT[];
