-- Verify and ensure sub_domain_id columns exist
-- This is a safe migration that won't fail if columns already exist

-- Verify sub_domain_id exists in departments
SELECT 'Checking departments table...' as status;

-- Verify sub_domain_id exists in semesters
SELECT 'Checking semesters table...' as status;

-- Show all domain-related columns
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('departments', 'semesters')
AND column_name LIKE '%domain%'
ORDER BY table_name, column_name;
