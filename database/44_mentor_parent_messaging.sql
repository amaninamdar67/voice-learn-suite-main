-- Mentor-Parent Messaging System
CREATE TABLE mentor_parent_messages (
  id BIGSERIAL PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'alert', 'update'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_mentor_parent_messages_mentor ON mentor_parent_messages(mentor_id);
CREATE INDEX idx_mentor_parent_messages_parent ON mentor_parent_messages(parent_id);
CREATE INDEX idx_mentor_parent_messages_student ON mentor_parent_messages(student_id);
CREATE INDEX idx_mentor_parent_messages_created ON mentor_parent_messages(created_at DESC);

-- Student Performance Analytics for Parent-Mentor View
CREATE TABLE student_performance_analytics (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Academic metrics
  average_quiz_score DECIMAL(5,2),
  total_quizzes_taken INT DEFAULT 0,
  average_assignment_score DECIMAL(5,2),
  total_assignments_completed INT DEFAULT 0,
  
  -- Engagement metrics
  total_lessons_viewed INT DEFAULT 0,
  total_videos_watched INT DEFAULT 0,
  average_attendance_percentage DECIMAL(5,2),
  
  -- Progress tracking
  improvement_trend VARCHAR(20), -- 'improving', 'stable', 'declining'
  last_activity_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_performance_student ON student_performance_analytics(student_id);
CREATE INDEX idx_student_performance_mentor ON student_performance_analytics(mentor_id);
CREATE INDEX idx_student_performance_parent ON student_performance_analytics(parent_id);

-- Alerts for Parents and Mentors
CREATE TABLE mentor_parent_alerts (
  id BIGSERIAL PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  alert_type VARCHAR(50), -- 'low_score', 'low_attendance', 'improvement', 'assignment_due'
  alert_title VARCHAR(255),
  alert_description TEXT,
  severity VARCHAR(20), -- 'low', 'medium', 'high'
  is_resolved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX idx_alerts_mentor ON mentor_parent_alerts(mentor_id);
CREATE INDEX idx_alerts_parent ON mentor_parent_alerts(parent_id);
CREATE INDEX idx_alerts_student ON mentor_parent_alerts(student_id);

-- Enable RLS
ALTER TABLE mentor_parent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_parent_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messaging
CREATE POLICY "Mentors can view their messages" ON mentor_parent_messages
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = parent_id);

CREATE POLICY "Mentors can send messages" ON mentor_parent_messages
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Parents can send messages" ON mentor_parent_messages
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for analytics
CREATE POLICY "Mentors can view student analytics" ON student_performance_analytics
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = parent_id);

-- RLS Policies for alerts
CREATE POLICY "Mentors and parents can view alerts" ON mentor_parent_alerts
  FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = parent_id);

CREATE POLICY "Mentors can create alerts" ON mentor_parent_alerts
  FOR INSERT WITH CHECK (auth.uid() = mentor_id);
