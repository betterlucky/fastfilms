-- First, create a backup of the current data
CREATE TABLE venue_backup AS SELECT * FROM "Venue";

-- Add a temporary column to store the array
ALTER TABLE "Venue" ADD COLUMN contact_email_array TEXT[];

-- Update the new column with the converted data
UPDATE "Venue" 
SET contact_email_array = ARRAY["contactEmail"] 
WHERE "contactEmail" IS NOT NULL;

-- Drop the old column
ALTER TABLE "Venue" DROP COLUMN "contactEmail";

-- Rename the new column to the original name
ALTER TABLE "Venue" RENAME COLUMN contact_email_array TO "contactEmail"; 