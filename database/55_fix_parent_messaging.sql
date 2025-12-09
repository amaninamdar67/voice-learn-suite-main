-- Fix parent messaging issues
-- This script ensures all necessary data is in place for parent-mentor messaging

-- 1. Verify parent_student_links exists and has data
SELECT 'parent_student_links' as table_name, COUNT(*) as record_count FROM parent_student_links;

-- 2. Verify mentor_student_links exists and has data
SELECT 'mentor_student_links' as table_name, COUNT(*) as record_count FROM mentor_student_links;

-- 3. Check for any parent-student-mentor combinations
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
LIMIT 20;

-- 4. Verify mentor_parent_messages table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mentor_parent_messages'
ORDER BY ordinal_position;

-- 5. Check for any existing messages
SELECT COUNT(*) as total_messages, 
       COUNT(CASE WHEN is_deleted = FALSE THEN 1 END) as active_messages
FROM mentor_parent_messages;

-- 6. Verify all required columns exist
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS reply_to_id BIGINT REFERENCES mentor_parent_messages(id) ON DELETE CASCADE;

-- 7. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_sender ON mentor_parent_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_is_deleted ON mentor_parent_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_reply_to ON mentor_parent_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_not_deleted 
ON mentor_parent_messages(is_deleted, created_at DESC) 
WHERE is_deleted = FALSE;

-- 8. Verify RLS is disabled (backend uses service role)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mentor_parent_messages';

-- 9. Disable RLS on mentor_parent_messages if it's enabled
ALTER TABLE mentor_parent_messages DISABLE ROW LEVEL SECURITY;

-- 10. Check for any constraint issues
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'mentor_parent_messages'
ORDER BY constraint_name;
