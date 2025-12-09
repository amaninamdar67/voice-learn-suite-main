-- Add message_status column to mentor_parent_messages
-- Status: 'active' (current relationship), 'archived' (old relationship)

ALTER TABLE mentor_parent_messages 
ADD COLUMN IF NOT EXISTS message_status VARCHAR(20) DEFAULT 'active';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_status 
ON mentor_parent_messages(message_status);

-- Create index for filtering by student and status
CREATE INDEX IF NOT EXISTS idx_mentor_parent_messages_student_status 
ON mentor_parent_messages(student_id, message_status);
