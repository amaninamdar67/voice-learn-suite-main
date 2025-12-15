-- First check if mentor exists and has correct role
SELECT id, full_name, role FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Get list of students to link
SELECT id, full_name FROM profiles WHERE role = 'student' LIMIT 5;

-- Delete any existing links for this mentor first
DELETE FROM mentor_student_links WHERE mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Get the first 3 student IDs and create links
WITH student_ids AS (
  SELECT id FROM profiles WHERE role = 'student' LIMIT 3
)
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' as mentor_id,
  id as student_id,
  NOW() as created_at
FROM student_ids;

-- Verify the links were created
SELECT 
  COUNT(*) as total_links,
  m.full_name as mentor_name
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
WHERE msl.mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d'
GROUP BY m.full_name;

-- Show the actual links
SELECT 
  m.full_name as mentor_name,
  s.full_name as student_name,
  msl.created_at
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
WHERE msl.mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d'
ORDER BY msl.created_at DESC;
