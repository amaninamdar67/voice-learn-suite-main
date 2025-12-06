-- Fix RLS policies to allow service role (backend) to perform admin operations
-- Service role should bypass RLS, but we'll add explicit policies just in case

-- Drop existing restrictive policies on profiles for department/semester/subdomain
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Add policies that allow service role operations
-- Service role operations should work without auth.uid() checks

-- For profiles - allow deletion when subdomain is being deleted
CREATE POLICY "Allow admin delete of profiles"
  ON profiles FOR DELETE
  USING (true);

-- For departments - allow deletion
CREATE POLICY "Allow admin delete of departments"
  ON departments FOR DELETE
  USING (true);

-- For semesters - allow deletion
CREATE POLICY "Allow admin delete of semesters"
  ON semesters FOR DELETE
  USING (true);

-- Verify the policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'departments', 'semesters', 'sub_domains')
ORDER BY tablename, policyname;
