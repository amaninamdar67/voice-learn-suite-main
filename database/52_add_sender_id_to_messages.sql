-- Add sender_id column to mentor_parent_messages table to track who sent each message
ALTER TABLE mentor_parent_messages 
ADD COLUMN sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create index for faster sender lookups
CREATE INDEX idx_mentor_parent_messages_sender ON mentor_parent_messages(sender_id);

-- Update existing messages to set sender_id based on mentor_id (assuming mentors sent them initially)
-- This is a safe assumption since the table was just created
UPDATE mentor_parent_messages 
SET sender_id = mentor_id 
WHERE sender_id IS NULL;
