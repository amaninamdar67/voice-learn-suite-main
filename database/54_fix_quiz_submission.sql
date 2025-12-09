-- Fix quiz submission issues
-- Remove any unique constraints that prevent multiple attempts
-- Allow students to submit quizzes multiple times

-- Drop existing unique constraint if it exists
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_student_quiz_unique;

-- Ensure RLS is disabled for quiz_results to allow submissions
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;
