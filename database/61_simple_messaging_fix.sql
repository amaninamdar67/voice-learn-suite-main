-- Simple messaging fix - just link students without mentors
-- This is the minimal fix needed to get messaging working

-- Link all students without mentors to the first available mentor
WITH first_mentor AS (
  SELECT id FROM profiles WHERE role = 'mentor' ORDER BY created_at LIMIT 1
),
students_without_mentors AS (
  SELECT DISTINCT psl.student_id
  FROM parent_student_links psl
  LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
  WHERE msl.id IS NULL
)
INSERT INTO mentor_student_links (mentor_id, student_id)
SELECT fm.id, swm.student_id
FROM first_mentor fm
CROSS JOIN students_without_mentors swm
ON CONFLICT (mentor_id, student_id) DO NOTHING;

-- Verify the fix worked
SELECT 
  COUNT(DISTINCT psl.student_id) as total_students,
  COUNT(DISTINCT msl.student_id) as students_with_mentors,
  COUNT(DISTINCT psl.student_id) - COUNT(DISTINCT msl.student_id) as students_without_mentors
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id;
