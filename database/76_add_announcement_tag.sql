-- Add tag column to user_messages for announcement categorization
ALTER TABLE user_messages ADD COLUMN IF NOT EXISTS announcement_tag VARCHAR(50) DEFAULT 'normal';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_messages_announcement_tag ON user_messages(announcement_tag) WHERE message_type = 'announcement';

-- Add comment
COMMENT ON COLUMN user_messages.announcement_tag IS 'Tag for announcements: normal, urgent, important, etc.';
