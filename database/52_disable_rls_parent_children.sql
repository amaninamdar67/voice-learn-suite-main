-- Disable RLS on parent_children table
-- This table is accessed through the backend with service role key
-- RLS is preventing the service role from reading account linked counts

-- First, drop existing policies
DROP POLICY IF EXISTS "Parents can view their children" ON parent_children;
DROP POLICY IF EXISTS "Admins can manage parent-child links" ON parent_children;
DROP POLICY IF EXISTS "Admins can manage all parent-child links" ON parent_children;

-- Disable RLS
ALTER TABLE parent_children DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'parent_children';
