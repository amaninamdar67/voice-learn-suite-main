-- Clean up orphaned departments and semesters (those with NULL subdomain_id)
-- These are old records that don't belong to any specific subdomain

-- Delete orphaned semesters (with NULL subdomain_id)
DELETE FROM semesters 
WHERE subdomain_id IS NULL;

-- Delete orphaned departments (with NULL subdomain_id)
DELETE FROM departments 
WHERE subdomain_id IS NULL;

-- Verify cleanup
SELECT 'Cleanup completed!' as status;
SELECT COUNT(*) as remaining_orphaned_depts FROM departments WHERE subdomain_id IS NULL;
SELECT COUNT(*) as remaining_orphaned_sems FROM semesters WHERE subdomain_id IS NULL;
