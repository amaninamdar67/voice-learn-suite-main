-- Mentor-Student Links Table
CREATE TABLE IF NOT EXISTS mentor_student_links (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_student_student ON mentor_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_mentor ON mentor_student_links(mentor_id);

-- Mentoring Sessions Table
CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INT DEFAULT 60,
  notes TEXT,
  rating INT DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_student ON mentoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentor ON mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_date ON mentoring_sessions(session_date DESC);

-- Enable RLS
ALTER TABLE mentor_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_student_links
DROP POLICY IF EXISTS "Admins can manage mentor-student links" ON mentor_student_links;
CREATE POLICY "Admins can manage mentor-student links" ON mentor_student_links
  FOR ALL USING (true);

-- RLS Policies for mentoring_sessions
DROP POLICY IF EXISTS "Mentors can view their sessions" ON mentoring_sessions;
CREATE POLICY "Mentors can view their sessions" ON mentoring_sessions
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Mentors can create sessions" ON mentoring_sessions;
CREATE POLICY "Mentors can create sessions" ON mentoring_sessions
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentors can update their sessions" ON mentoring_sessions;
CREATE POLICY "Mentors can update their sessions" ON mentoring_sessions
  FOR UPDATE USING (auth.uid() = mentor_id);
