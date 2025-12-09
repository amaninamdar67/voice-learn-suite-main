-- Fix mentor-student linking
-- This script will ensure that all students have mentors linked

-- 1. First, let's see what mentors are available
SELECT id, full_name, role FROM profiles WHERE role = 'mentor' ORDER BY full_name;

-- 2. Check which students don't have mentors
SELECT 
  psl.student_id,
  p.full_name as student_name,
  COUNT(msl.id) as mentor_count
FROM parent_student_links psl
LEFT JOIN profiles p ON psl.student_id = p.id
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
GROUP BY psl.student_id, p.full_name
HAVING COUNT(msl.id) = 0
ORDER BY p.full_name;

-- 3. If there are students without mentors, we need to link them
-- First, get the default mentor (or the first available mentor)
-- Then link all students without mentors to this mentor

-- Get the first mentor
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

-- 4. Verify the linking was successful
SELECT 
  'After fix' as status,
  COUNT(DISTINCT psl.student_id) as total_students,
  COUNT(DISTINCT msl.student_id) as students_with_mentors,
  COUNT(DISTINCT psl.student_id) - COUNT(DISTINCT msl.student_id) as students_without_mentors
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id;

-- 5. Show the final linking status
SELECT 
  psl.parent_id,
  psl.student_id,
  msl.mentor_id,
  p1.full_name as parent_name,
  p2.full_name as student_name,
  p3.full_name as mentor_name
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
LEFT JOIN profiles p1 ON psl.parent_id = p1.id
LEFT JOIN profiles p2 ON psl.student_id = p2.id
LEFT JOIN profiles p3 ON msl.mentor_id = p3.id
ORDER BY psl.created_at DESC;
