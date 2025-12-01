-- Remove permission field from lessons table
-- Run this in Supabase SQL Editor

-- Drop the permission column and related constraints
ALTER TABLE lessons 
DROP COLUMN IF EXISTS permission;

-- Drop the index if it exists
DROP INDEX IF EXISTS lessons_permission_idx;

-- Remove permission-related columns that are no longer needed
ALTER TABLE lessons 
DROP COLUMN IF EXISTS is_analyzed;

ALTER TABLE lessons 
DROP COLUMN IF EXISTS analysis_data;

-- Drop the analyzed index
DROP INDEX IF EXISTS lessons_is_analyzed_idx;

SELECT 'Lesson permissions removed successfully! All documents are now accessible.' as status;
