-- ============================================================
-- MIGRATION: Add default_department and default_semester to sub_domains
-- ============================================================
-- This migration adds columns to store default department and semester
-- values that are automatically assigned to all users in a subdomain.
--
-- HOW TO APPLY:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Click "New Query"
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- ============================================================

-- Add the columns if they don't exist
ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS default_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS default_semester VARCHAR(255);

-- Add helpful comments
COMMENT ON COLUMN sub_domains.default_department IS 'Default department assigned to all users in this subdomain';
COMMENT ON COLUMN sub_domains.default_semester IS 'Default semester assigned to all users in this subdomain';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sub_domains' 
AND column_name IN ('default_department', 'default_semester')
ORDER BY column_name;
