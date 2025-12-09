-- Final fix for quiz_results table
-- Disable RLS to allow backend service role to insert quiz results

ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;
