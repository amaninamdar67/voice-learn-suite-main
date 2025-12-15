-- Step 1: Update the logged-in user to be a mentor
UPDATE profiles 
SET role = 'mentor'
WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Step 2: Verify the update worked
SELECT id, full_name, role FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';

-- Step 3: Now add mentor-student links (after mentor exists)
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' as mentor_id,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as student_id,
  NOW()
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' AND role = 'mentor')
ON CONFLICT DO NOTHING;

INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' as mentor_id,
  (SELECT id FROM profiles WHERE role = 'student' OFFSET 1 LIMIT 1) as student_id,
  NOW()
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' AND role = 'mentor')
ON CONFLICT DO NOTHING;

INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' as mentor_id,
  (SELECT id FROM profiles WHERE role = 'student' OFFSET 2 LIMIT 1) as student_id,
  NOW()
WHERE EXISTS (SELECT 1 FROM profiles WHERE id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d' AND role = 'mentor')
ON CONFLICT DO NOTHING;

-- Step 4: Verify the links were created
SELECT 
  m.full_name as mentor_name,
  s.full_name as student_name
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
WHERE msl.mentor_id = '7376c63b-ce12-4d92-b7b1-7f8b0a1f7f0d';
