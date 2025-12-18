-- AI Tutor Sessions Table
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- AI Tutor Messages Table (stores conversation history)
CREATE TABLE IF NOT EXISTS ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_tutor_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_data BYTEA,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user_id ON ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_created_at ON ai_tutor_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_messages_session_id ON ai_tutor_messages(session_id);

-- Enable RLS
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON ai_tutor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON ai_tutor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON ai_tutor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON ai_tutor_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their sessions" ON ai_tutor_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM ai_tutor_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their sessions" ON ai_tutor_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM ai_tutor_sessions WHERE user_id = auth.uid()
    )
  );
