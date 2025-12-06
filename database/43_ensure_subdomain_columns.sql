-- Ensure department_name and semester_name columns exist in sub_domains table
-- This is a safe migration that only adds columns if they don't exist

ALTER TABLE sub_domains
ADD COLUMN IF NOT EXISTS department_name text,
ADD COLUMN IF NOT EXISTS semester_name text;

SELECT 'Sub-domains columns verified!' as status;
