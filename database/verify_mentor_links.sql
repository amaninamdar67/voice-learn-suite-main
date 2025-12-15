-- Check all mentor-student links with mentor and student names
SELECT 
  msl.mentor_id,
  m.full_name as mentor_name,
  msl.student_id,
  s.full_name as student_name,
  msl.created_at
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
ORDER BY msl.created_at DESC;

-- Check all mentors
SELECT id, full_name, role FROM profiles WHERE role = 'mentor';

-- Check all students
SELECT id, full_name, role FROM profiles WHERE role = 'student' LIMIT 10;
