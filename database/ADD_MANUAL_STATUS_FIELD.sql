-- Add manual_status field to lesson_attendance table
-- This allows students to manually tag courses as To-Do, In-Progress, or Completed
-- Run this in Supabase SQL Editor

ALTER TABLE lesson_attendance 
ADD COLUMN IF NOT EXISTS manual_status VARCHAR(20) CHECK (manual_status IN ('todo', 'in-progress', 'completed'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS lesson_attendance_manual_status_idx ON lesson_attendance(manual_status);

-- Add comment
COMMENT ON COLUMN lesson_attendance.manual_status IS 'Manual progress status set by student: todo, in-progress, or completed';

SELECT 'Manual status field added successfully!' as status;
