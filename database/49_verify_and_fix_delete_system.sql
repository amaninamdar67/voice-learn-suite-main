-- Verify and Fix Message Delete System
-- This script ensures all necessary columns and indexes exist for soft delete functionality

-- 1. Ensure is_deleted column exists
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Ensure deleted_at column exists
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- 3. Create index for is_deleted if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_is_deleted 
ON mentor_parent_messages(is_deleted);

-- 4. Create index for deleted_at if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_deleted_at 
ON mentor_parent_messages(deleted_at);

-- 5. Create composite index for faster queries
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_not_deleted 
ON mentor_parent_messages(is_deleted, created_at DESC) 
WHERE is_deleted = FALSE;

-- 6. Verify the table structure
-- Run this query to check if columns exist:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'mentor_parent_messages' 
-- AND column_name IN ('is_deleted', 'deleted_at');

-- 7. Update any NULL values to FALSE for is_deleted
UPDATE mentor_parent_messages 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;

-- 8. Verify data integrity
-- Check for any messages that might have issues:
-- SELECT id, is_deleted, deleted_at, message 
-- FROM mentor_parent_messages 
-- WHERE is_deleted = TRUE 
-- LIMIT 10;

-- 9. Optional: View all non-deleted messages (what the app should show)
-- SELECT id, mentor_id, parent_id, student_id, message, created_at 
-- FROM mentor_parent_messages 
-- WHERE is_deleted = FALSE 
-- ORDER BY created_at DESC 
-- LIMIT 20;

-- 10. Optional: View all deleted messages (for audit purposes)
-- SELECT id, mentor_id, parent_id, student_id, message, deleted_at 
-- FROM mentor_parent_messages 
-- WHERE is_deleted = TRUE 
-- ORDER BY deleted_at DESC 
-- LIMIT 20;
