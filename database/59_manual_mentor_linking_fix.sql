-- Manual fix for mentor-student linking
-- This script will link all students that don't have mentors to the first available mentor

-- 1. Get all students that don't have mentors
SELECT 
  psl.student_id,
  p.full_name as student_name,
  psl.parent_id,
  p2.full_name as parent_name
FROM parent_student_links psl
LEFT JOIN profiles p ON psl.student_id = p.id
LEFT JOIN profiles p2 ON psl.parent_id = p2.id
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
WHERE msl.id IS NULL
ORDER BY p.full_name;

-- 2. Link all students without mentors to the first available mentor
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

-- 3. Verify the fix
SELECT 
  'After fix' as status,
  COUNT(DISTINCT psl.student_id) as total_students,
  COUNT(DISTINCT msl.student_id) as students_with_mentors
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id;

-- 4. Show all parent-student-mentor combinations
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
