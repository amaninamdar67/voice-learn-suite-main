-- Disable RLS on admin-only tables
-- These tables are only accessed through the backend with service role key
-- RLS is causing issues with cascade deletes and admin operations

-- Disable RLS on domains
ALTER TABLE domains DISABLE ROW LEVEL SECURITY;

-- Disable RLS on departments
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on sub_domains
ALTER TABLE sub_domains DISABLE ROW LEVEL SECURITY;

-- Disable RLS on semesters
ALTER TABLE semesters DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('domains', 'departments', 'sub_domains', 'semesters')
ORDER BY tablename;
