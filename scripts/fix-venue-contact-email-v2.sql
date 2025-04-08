-- Drop the existing column and recreate it with the correct type
BEGIN;

-- Create a temporary table to store the data
CREATE TEMP TABLE temp_venue AS SELECT * FROM "Venue";

-- Drop and recreate the column with the correct type
ALTER TABLE "Venue" DROP COLUMN "contactEmail";
ALTER TABLE "Venue" ADD COLUMN "contactEmail" TEXT[] DEFAULT '{}';

-- Update with the data from the temporary table
UPDATE "Venue" v
SET "contactEmail" = ARRAY[t."contactEmail"]
FROM temp_venue t
WHERE v.id = t.id;

-- Drop the temporary table
DROP TABLE temp_venue;

-- Drop the backup table from previous attempt if it exists
DROP TABLE IF EXISTS venue_backup;

COMMIT; 