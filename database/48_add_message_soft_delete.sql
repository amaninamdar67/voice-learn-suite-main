-- Add is_deleted column to mentor_parent_messages table for soft delete
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_is_deleted 
ON mentor_parent_messages(is_deleted);
