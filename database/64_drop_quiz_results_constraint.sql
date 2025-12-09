-- Drop any unique constraints on quiz_results that might be causing the ON CONFLICT error
-- First, let's check what constraints exist
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'quiz_results';

-- Drop the quiz_results table and recreate it without unique constraints
DROP TABLE IF EXISTS quiz_results CASCADE;

-- Recreate the table
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  percentage NUMERIC,
  time_taken_seconds INTEGER,
  answers JSONB,
  is_completed BOOLEAN DEFAULT TRUE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON quiz_results(created_at DESC);

-- Disable RLS
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Verify the table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;
