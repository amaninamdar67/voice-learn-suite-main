-- Update the logged-in user to be a mentor
UPDATE profiles 
SET role = 'mentor'
WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Add mentor-student links for this mentor
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
VALUES 
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' LIMIT 1), NOW()),
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' OFFSET 1 LIMIT 1), NOW()),
  ('7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d', (SELECT id FROM profiles WHERE role = 'student' OFFSET 2 LIMIT 1), NOW())
ON CONFLICT DO NOTHING;

-- Verify
SELECT id, full_name, role FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

SELECT 
  m.full_name as mentor_name,
  s.full_name as student_name
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
WHERE msl.mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';
