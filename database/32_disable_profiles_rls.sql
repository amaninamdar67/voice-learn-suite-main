-- Disable RLS on profiles table to allow admin operations
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles'
ORDER BY tablename;
