-- Fix quiz_results table
-- Ensure the table exists with proper structure

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score DECIMAL(10, 2) NOT NULL,
  total_marks DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  time_taken_seconds INT,
  answers JSONB,
  is_completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON quiz_results(created_at DESC);

-- Disable RLS (backend uses service role)
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;
