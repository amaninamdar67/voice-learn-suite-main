-- Diagnose messaging issue
-- This script will help identify why messages are failing to send

-- 1. Check if parent_student_links has any records
SELECT 'parent_student_links' as table_name, COUNT(*) as record_count FROM parent_student_links;

-- 2. Check if mentor_student_links has any records
SELECT 'mentor_student_links' as table_name, COUNT(*) as record_count FROM mentor_student_links;

-- 3. Get all parent-student-mentor combinations
SELECT 
  psl.parent_id,
  psl.student_id,
  msl.mentor_id,
  p1.full_name as parent_name,
  p2.full_name as student_name,
  p3.full_name as mentor_name,
  p1.role as parent_role,
  p2.role as student_role,
  p3.role as mentor_role
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
LEFT JOIN profiles p1 ON psl.parent_id = p1.id
LEFT JOIN profiles p2 ON psl.student_id = p2.id
LEFT JOIN profiles p3 ON msl.mentor_id = p3.id
ORDER BY psl.created_at DESC
LIMIT 20;

-- 4. Check for any profiles that might be missing
SELECT 
  'Missing parent' as issue,
  COUNT(*) as count
FROM parent_student_links psl
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = psl.parent_id)
UNION ALL
SELECT 
  'Missing student' as issue,
  COUNT(*) as count
FROM parent_student_links psl
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = psl.student_id)
UNION ALL
SELECT 
  'Missing mentor' as issue,
  COUNT(*) as count
FROM mentor_student_links msl
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = msl.mentor_id)
UNION ALL
SELECT 
  'Missing student (mentor link)' as issue,
  COUNT(*) as count
FROM mentor_student_links msl
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = msl.student_id);

-- 5. Check mentor_parent_messages table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'mentor_parent_messages'
ORDER BY ordinal_position;

-- 6. Check for any foreign key constraints
SELECT 
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'mentor_parent_messages'
AND referenced_table_name IS NOT NULL;

-- 7. Check if RLS is enabled on mentor_parent_messages
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mentor_parent_messages';

-- 8. Try to insert a test message (this will fail if there's an issue)
-- First, get a valid parent-student-mentor combination
WITH valid_combo AS (
  SELECT 
    psl.parent_id,
    psl.student_id,
    msl.mentor_id
  FROM parent_student_links psl
  LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
  WHERE msl.mentor_id IS NOT NULL
  LIMIT 1
)
INSERT INTO mentor_parent_messages (mentor_id, parent_id, student_id, message, message_type, sender_id)
SELECT mentor_id, parent_id, student_id, 'Test message', 'text', parent_id
FROM valid_combo
ON CONFLICT DO NOTHING;

-- 9. Check if the test message was inserted
SELECT COUNT(*) as test_messages
FROM mentor_parent_messages
WHERE message = 'Test message';
