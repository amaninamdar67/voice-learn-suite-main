-- Add test mentor-student links for testing the mentoring page
-- This script creates sample links between mentors and students

-- First, get a mentor and some students from the database
-- You can modify these UUIDs based on your actual user IDs

-- Example: Link a mentor to students
-- Replace the UUIDs with actual mentor and student IDs from your profiles table

-- Get mentor ID (replace with actual mentor user ID)
-- Get student IDs (replace with actual student user IDs)

-- Insert test mentor-student links
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  (SELECT id FROM profiles WHERE role = 'mentor' LIMIT 1) as mentor_id,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as student_id,
  NOW()
WHERE 
  (SELECT id FROM profiles WHERE role = 'mentor' LIMIT 1) IS NOT NULL
  AND (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert more test links if multiple students exist
INSERT INTO mentor_student_links (mentor_id, student_id, created_at)
SELECT 
  (SELECT id FROM profiles WHERE role = 'mentor' LIMIT 1) as mentor_id,
  (SELECT id FROM profiles WHERE role = 'student' OFFSET 1 LIMIT 1) as student_id,
  NOW()
WHERE 
  (SELECT id FROM profiles WHERE role = 'mentor' LIMIT 1) IS NOT NULL
  AND (SELECT id FROM profiles WHERE role = 'student' OFFSET 1 LIMIT 1) IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verify the links were created
SELECT 
  'mentor_student_links' as table_name,
  COUNT(*) as total_links,
  COUNT(DISTINCT mentor_id) as unique_mentors,
  COUNT(DISTINCT student_id) as unique_students
FROM mentor_student_links;

-- Show the created links with mentor and student names
SELECT 
  m.full_name as mentor_name,
  s.full_name as student_name,
  msl.created_at
FROM mentor_student_links msl
JOIN profiles m ON msl.mentor_id = m.id
JOIN profiles s ON msl.student_id = s.id
ORDER BY msl.created_at DESC;
