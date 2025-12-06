-- =====================================================
-- PARENT-STUDENT & MENTOR-STUDENT LINKING SYSTEM
-- =====================================================
-- This schema enables parents to monitor their children
-- and mentors to guide their assigned students

-- =====================================================
-- 1. ADD LINKING COLUMNS TO STUDENTS TABLE
-- =====================================================

-- Add parent_id column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES parents(id) ON DELETE SET NULL;

-- Add mentor_id column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES mentors(id) ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_mentor_id ON students(mentor_id);

-- =====================================================
-- 2. CREATE PARENT-CHILD RELATIONSHIP TABLE
-- =====================================================
-- This allows one parent to have multiple children
-- and handles complex family structures

CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'parent', -- parent, guardian, foster_parent
  is_primary_contact BOOLEAN DEFAULT true,
  can_view_grades BOOLEAN DEFAULT true,
  can_view_attendance BOOLEAN DEFAULT true,
  can_view_behavior BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_by UUID REFERENCES users(id),
  notes TEXT,
  
  -- Ensure unique parent-student pairs
  UNIQUE(parent_id, student_id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_student ON parent_children(student_id);

-- Enable RLS
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their children"
  ON parent_children FOR SELECT
  USING (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all parent-child links"
  ON parent_children FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 3. CREATE MENTOR-STUDENT RELATIONSHIP TABLE
-- =====================================================
-- This allows mentors to be assigned multiple students
-- and tracks mentoring relationships

CREATE TABLE IF NOT EXISTS mentor_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  mentoring_focus TEXT, -- academic, behavioral, career, etc.
  meeting_frequency VARCHAR(50), -- weekly, biweekly, monthly
  last_meeting_date DATE,
  next_meeting_date DATE,
  notes TEXT,
  
  -- Ensure unique mentor-student pairs
  UNIQUE(mentor_id, student_id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentor_students_mentor ON mentor_students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_student ON mentor_students(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_active ON mentor_students(is_active);

-- Enable RLS
ALTER TABLE mentor_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Mentors can view their students"
  ON mentor_students FOR SELECT
  USING (mentor_id IN (
    SELECT id FROM mentors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all mentor-student links"
  ON mentor_students FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 4. CREATE MENTORING NOTES TABLE
-- =====================================================
-- Track mentoring sessions and progress notes

CREATE TABLE IF NOT EXISTS mentoring_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_student_id UUID NOT NULL REFERENCES mentor_students(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  duration_minutes INTEGER,
  topics_discussed TEXT,
  student_mood VARCHAR(50), -- excellent, good, neutral, concerned, worried
  progress_notes TEXT,
  action_items TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  is_confidential BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentoring_notes_mentor ON mentoring_notes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_notes_student ON mentoring_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_notes_date ON mentoring_notes(meeting_date);

-- Enable RLS
ALTER TABLE mentoring_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Mentors can manage their notes"
  ON mentoring_notes FOR ALL
  USING (mentor_id IN (
    SELECT id FROM mentors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all mentoring notes"
  ON mentoring_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 5. CREATE PARENT NOTIFICATIONS TABLE
-- =====================================================
-- Track notifications sent to parents

CREATE TABLE IF NOT EXISTS parent_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- grade, attendance, behavior, assignment, quiz
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, urgent
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  related_entity_type VARCHAR(50), -- quiz, assignment, lesson, etc.
  related_entity_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent ON parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_student ON parent_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_read ON parent_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_created ON parent_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their notifications"
  ON parent_notifications FOR SELECT
  USING (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  ));

CREATE POLICY "Parents can update their notifications"
  ON parent_notifications FOR UPDATE
  USING (parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  ));

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get all children for a parent
CREATE OR REPLACE FUNCTION get_parent_children(p_parent_user_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name VARCHAR,
  student_email VARCHAR,
  grade VARCHAR,
  section VARCHAR,
  relationship_type VARCHAR,
  is_primary_contact BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    u.email,
    s.grade,
    s.section,
    pc.relationship_type,
    pc.is_primary_contact
  FROM parent_children pc
  JOIN students s ON pc.student_id = s.id
  JOIN users u ON s.user_id = u.id
  JOIN parents p ON pc.parent_id = p.id
  WHERE p.user_id = p_parent_user_id
  ORDER BY pc.is_primary_contact DESC, s.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all students for a mentor
CREATE OR REPLACE FUNCTION get_mentor_students(p_mentor_user_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name VARCHAR,
  student_email VARCHAR,
  grade VARCHAR,
  section VARCHAR,
  assigned_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN,
  mentoring_focus TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    u.email,
    s.grade,
    s.section,
    ms.assigned_at,
    ms.is_active,
    ms.mentoring_focus
  FROM mentor_students ms
  JOIN students s ON ms.student_id = s.id
  JOIN users u ON s.user_id = u.id
  JOIN mentors m ON ms.mentor_id = m.id
  WHERE m.user_id = p_mentor_user_id
    AND ms.is_active = true
  ORDER BY s.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CREATE TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_children_updated_at
  BEFORE UPDATE ON parent_children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_students_updated_at
  BEFORE UPDATE ON mentor_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentoring_notes_updated_at
  BEFORE UPDATE ON mentoring_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERT SAMPLE DATA (FOR TESTING)
-- =====================================================

-- Note: Run this only in development/testing
-- Comment out for production

/*
-- Link first parent to first two students
INSERT INTO parent_children (parent_id, student_id, relationship_type, is_primary_contact)
SELECT 
  p.id,
  s.id,
  'parent',
  true
FROM parents p
CROSS JOIN students s
WHERE p.id = (SELECT id FROM parents LIMIT 1)
  AND s.id IN (SELECT id FROM students LIMIT 2)
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- Link first mentor to first three students
INSERT INTO mentor_students (mentor_id, student_id, mentoring_focus, meeting_frequency)
SELECT 
  m.id,
  s.id,
  'Academic Support',
  'weekly'
FROM mentors m
CROSS JOIN students s
WHERE m.id = (SELECT id FROM mentors LIMIT 1)
  AND s.id IN (SELECT id FROM students LIMIT 3)
ON CONFLICT (mentor_id, student_id) DO NOTHING;
*/

-- =====================================================
-- COMPLETED: Parent-Student & Mentor-Student Linking
-- =====================================================

COMMENT ON TABLE parent_children IS 'Links parents to their children with permission settings';
COMMENT ON TABLE mentor_students IS 'Links mentors to their assigned students';
COMMENT ON TABLE mentoring_notes IS 'Tracks mentoring sessions and progress notes';
COMMENT ON TABLE parent_notifications IS 'Notifications sent to parents about their children';

