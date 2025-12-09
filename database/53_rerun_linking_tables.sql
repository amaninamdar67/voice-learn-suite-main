-- Re-run all linking table queries to ensure proper setup
-- This file ensures mentor_student_links and parent_student_links are properly configured
-- Note: parent_children table is not used (0 records), using parent_student_links instead

-- ============================================
-- 1. MENTOR_STUDENT_LINKS TABLE
-- ============================================

-- Create mentor_student_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentor_student_links (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(mentor_id, student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS mentor_student_links_mentor_id_idx ON mentor_student_links(mentor_id);
CREATE INDEX IF NOT EXISTS mentor_student_links_student_id_idx ON mentor_student_links(student_id);

-- Disable RLS on mentor_student_links (accessed via backend service role)
ALTER TABLE mentor_student_links DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PARENT_STUDENT_LINKS TABLE
-- ============================================

-- Create parent_student_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS parent_student_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(parent_id, student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS parent_student_links_parent_id_idx ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS parent_student_links_student_id_idx ON parent_student_links(student_id);

-- Disable RLS on parent_student_links (accessed via backend service role)
ALTER TABLE parent_student_links DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. VERIFY ALL TABLES
-- ============================================

-- Verify all linking tables exist and RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('mentor_student_links', 'parent_student_links')
ORDER BY tablename;

-- Show current linking data
SELECT 'mentor_student_links' as table_name, COUNT(*) as record_count FROM mentor_student_links
UNION ALL
SELECT 'parent_student_links', COUNT(*) FROM parent_student_links;
