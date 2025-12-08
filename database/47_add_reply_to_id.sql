-- Add reply_to_id column to mentor_parent_messages table
ALTER TABLE mentor_parent_messages 
ADD COLUMN reply_to_id BIGINT REFERENCES mentor_parent_messages(id) ON DELETE CASCADE;

-- Create index for faster reply lookups
CREATE INDEX idx_mentor_parent_messages_reply_to ON mentor_parent_messages(reply_to_id);
