-- Add sender_id column to mentor_parent_messages if it doesn't exist
ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create index for sender_id
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_sender 
ON mentor_parent_messages(sender_id);
