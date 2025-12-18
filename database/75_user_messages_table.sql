-- Generic User Messages Table
-- For storing messages between any two users (teacher-student, student-mentor, etc.)

CREATE TABLE IF NOT EXISTS user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  reply_to_id UUID REFERENCES user_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_messages_sender ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_receiver ON user_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_conversation ON user_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created ON user_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_messages_is_deleted ON user_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_user_messages_not_deleted_created ON user_messages(is_deleted, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_messages_reply_to ON user_messages(reply_to_id);

-- Disable RLS (backend uses service role key)
ALTER TABLE user_messages DISABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE user_messages IS 'Generic messaging table for all user-to-user conversations (teacher-student, student-mentor, etc.)';
COMMENT ON COLUMN user_messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN user_messages.receiver_id IS 'User who receives the message';
COMMENT ON COLUMN user_messages.message IS 'Message content';
COMMENT ON COLUMN user_messages.message_type IS 'Type of message (text, image, file, etc.)';
COMMENT ON COLUMN user_messages.is_read IS 'Whether the receiver has read the message';
COMMENT ON COLUMN user_messages.is_deleted IS 'Soft delete flag';
COMMENT ON COLUMN user_messages.reply_to_id IS 'ID of the message this is replying to (for threading)';
