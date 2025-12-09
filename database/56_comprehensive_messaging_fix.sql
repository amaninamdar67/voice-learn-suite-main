-- Comprehensive fix for parent-mentor messaging
-- This script ensures all tables, columns, and constraints are properly set up

-- 1. Ensure mentor_parent_messages table exists with all required columns
CREATE TABLE IF NOT EXISTS mentor_parent_messages (
  id BIGSERIAL PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP DEFAULT NULL,
  reply_to_id BIGINT REFERENCES mentor_parent_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS reply_to_id BIGINT REFERENCES mentor_parent_messages(id) ON DELETE CASCADE;

-- 3. Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_mentor ON mentor_parent_messages(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_parent ON mentor_parent_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_student ON mentor_parent_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_created ON mentor_parent_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_sender ON mentor_parent_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_is_deleted ON mentor_parent_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_reply_to ON mentor_parent_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_not_deleted 
ON mentor_parent_messages(is_deleted, created_at DESC) 
WHERE is_deleted = FALSE;

-- 4. Disable RLS (backend uses service role key)
ALTER TABLE mentor_parent_messages DISABLE ROW LEVEL SECURITY;

-- 5. Ensure parent_student_links table exists
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship VARCHAR(50) DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_student ON parent_student_links(student_id);

-- 6. Ensure mentor_student_links table exists
CREATE TABLE IF NOT EXISTS mentor_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_student_links_mentor ON mentor_student_links(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_links_student ON mentor_student_links(student_id);

-- 7. Disable RLS on linking tables (backend uses service role)
ALTER TABLE parent_student_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_student_links DISABLE ROW LEVEL SECURITY;

-- 8. Verify data integrity - check for orphaned messages
-- Messages where mentor, parent, or student don't exist
SELECT COUNT(*) as orphaned_messages
FROM mentor_parent_messages mpm
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = mpm.mentor_id)
   OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = mpm.parent_id)
   OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = mpm.student_id);

-- 9. Check linking status
SELECT 
  'parent_student_links' as table_name,
  COUNT(*) as total_links,
  COUNT(DISTINCT parent_id) as unique_parents,
  COUNT(DISTINCT student_id) as unique_students
FROM parent_student_links
UNION ALL
SELECT 
  'mentor_student_links' as table_name,
  COUNT(*) as total_links,
  COUNT(DISTINCT mentor_id) as unique_mentors,
  COUNT(DISTINCT student_id) as unique_students
FROM mentor_student_links;

-- 10. Check message status
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN is_deleted = FALSE THEN 1 END) as active_messages,
  COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) as deleted_messages
FROM mentor_parent_messages;

-- 11. Verify all required columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mentor_parent_messages'
ORDER BY ordinal_position;
