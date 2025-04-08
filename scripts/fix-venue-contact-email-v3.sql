BEGIN;

-- Create a temporary table to store the data
CREATE TEMP TABLE temp_venue AS SELECT * FROM "Venue";

-- Drop and recreate the column with the correct type
ALTER TABLE "Venue" DROP COLUMN "contactEmail";
ALTER TABLE "Venue" ADD COLUMN "contactEmail" TEXT[] DEFAULT '{}';

-- Update with the data from the temporary table, ensuring single-dimensional arrays
UPDATE "Venue" v
SET "contactEmail" = CASE 
    WHEN t."contactEmail" IS NULL THEN '{}'
    WHEN t."contactEmail" = '{}' THEN '{}'
    ELSE ARRAY[t."contactEmail"]
END
FROM temp_venue t
WHERE v.id = t.id;

-- Drop the temporary table
DROP TABLE temp_venue;

-- Drop the backup table from previous attempt if it exists
DROP TABLE IF EXISTS venue_backup;

-- Verify the data
SELECT id, "contactEmail" FROM "Venue";

COMMIT; 