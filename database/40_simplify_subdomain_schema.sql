-- Simplify sub_domains schema by storing department and semester as text fields
-- This removes the need for separate department and semester tables

-- Add department and semester columns to sub_domains if they don't exist
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS department_name text,
ADD COLUMN IF NOT EXISTS semester_name text;

-- Drop the separate departments and semesters tables (optional - only if you want to clean up)
-- DROP TABLE IF EXISTS semesters CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;

-- For now, just add the columns and migrate existing data
-- If you have existing departments/semesters, you can migrate them manually

SELECT 'Sub-domains schema simplified!' as status;
