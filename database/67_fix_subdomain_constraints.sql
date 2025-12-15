-- Check and fix subdomain constraints
-- This ensures default_department and default_semester columns are properly set up

-- First, let's see what constraints exist
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'sub_domains';

-- Make sure the columns exist and are nullable
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);

-- Ensure columns are nullable (they should be by default)
ALTER TABLE sub_domains
ALTER COLUMN default_department DROP NOT NULL;

ALTER TABLE sub_domains
ALTER COLUMN default_semester DROP NOT NULL;

-- Verify the columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sub_domains'
ORDER BY column_name;
