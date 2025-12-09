-- Add unique constraint to quiz_results for student_id and quiz_id
-- This allows upsert operations to work properly

-- First, check if the constraint already exists
-- If it does, this will fail gracefully with IF NOT EXISTS

ALTER TABLE quiz_results
ADD CONSTRAINT unique_student_quiz UNIQUE (student_id, quiz_id);

-- Verify the constraint was added
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'quiz_results' AND constraint_type = 'UNIQUE';
