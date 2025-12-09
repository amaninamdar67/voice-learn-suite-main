-- Complete messaging fix
-- This script will ensure all necessary linking is in place and all tables are properly configured

-- 1. Ensure all tables exist with proper structure
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship VARCHAR(50) DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS mentor_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, student_id)
);

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

-- 2. Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_student ON parent_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_links_mentor ON mentor_student_links(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_links_student ON mentor_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_mentor ON mentor_parent_messages(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_parent ON mentor_parent_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_student ON mentor_parent_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_sender ON mentor_parent_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_is_deleted ON mentor_parent_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_reply_to ON mentor_parent_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_created ON mentor_parent_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_not_deleted 
ON mentor_parent_messages(is_deleted, created_at DESC) 
WHERE is_deleted = FALSE;

-- 3. Disable RLS on all tables (backend uses service role key)
ALTER TABLE parent_student_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_student_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_parent_messages DISABLE ROW LEVEL SECURITY;

-- 4. Link all students without mentors to the first available mentor
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

-- 5. Verify the fix
SELECT 
  'Status' as check_name,
  'Total parent-student links' as description,
  COUNT(*)::text as value
FROM parent_student_links
UNION ALL
SELECT 
  'Status' as check_name,
  'Total mentor-student links' as description,
  COUNT(*)::text as value
FROM mentor_student_links
UNION ALL
SELECT 
  'Status' as check_name,
  'Students with mentors' as description,
  COUNT(DISTINCT msl.student_id)::text as value
FROM mentor_student_links msl
UNION ALL
SELECT 
  'Status' as check_name,
  'Students without mentors' as description,
  (COUNT(DISTINCT psl.student_id) - COUNT(DISTINCT msl.student_id))::text as value
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id;

-- 6. Show all parent-student-mentor combinations
SELECT 
  psl.parent_id,
  psl.student_id,
  msl.mentor_id,
  p1.full_name as parent_name,
  p2.full_name as student_name,
  p3.full_name as mentor_name,
  psl.created_at as linked_at
FROM parent_student_links psl
LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
LEFT JOIN profiles p1 ON psl.parent_id = p1.id
LEFT JOIN profiles p2 ON psl.student_id = p2.id
LEFT JOIN profiles p3 ON msl.mentor_id = p3.id
ORDER BY psl.created_at DESC;

-- 7. Test message insert (optional - uncomment to test)
-- WITH valid_combo AS (
--   SELECT 
--     psl.parent_id,
--     psl.student_id,
--     msl.mentor_id
--   FROM parent_student_links psl
--   LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
--   WHERE msl.mentor_id IS NOT NULL
--   LIMIT 1
-- )
-- INSERT INTO mentor_parent_messages (mentor_id, parent_id, student_id, message, message_type, sender_id)
-- SELECT mentor_id, parent_id, student_id, 'Test message', 'text', parent_id
-- FROM valid_combo;
