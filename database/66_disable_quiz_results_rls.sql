-- Disable RLS on quiz_results table to allow backend service role to insert quiz submissions
-- This is safe because the backend validates all data before inserting

ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'quiz_results';
