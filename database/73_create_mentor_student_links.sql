-- First, verify the mentor exists and has the correct role
SELECT id, full_name, role FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Get some student IDs to link
SELECT id, full_name, role FROM profiles WHERE role = 'student' LIMIT 5;

-- Now create mentor-student links with actual student IDs
-- Replace the student IDs below with real ones from your database
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
VALUES 
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' LIMIT 1), NOW()),
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' OFFSET 1 LIMIT 1), NOW()),
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' OFFSET 2 LIMIT 1), NOW())
ON CONFLICT DO NOTHING;

-- Verify the links were created
SELECT 
  m.full_name as mentor_name,
  s.full_name as student_name,
  msl.created_at
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
WHERE msl.mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d'
ORDER BY msl.created_at DESC;
