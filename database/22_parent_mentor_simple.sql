-- =====================================================
-- PARENT-STUDENT & MENTOR-STUDENT LINKING (SIMPLE VERSION)
-- Works with profiles table only
-- =====================================================

-- =====================================================
-- 1. PARENT-CHILD LINKS
-- =====================================================

CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'parent',
  is_primary_contact BOOLEAN DEFAULT true,
  can_view_grades BOOLEAN DEFAULT true,
  can_view_attendance BOOLEAN DEFAULT true,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  UNIQUE(parent_id, student_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_student ON parent_children(student_id);

ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children"
  ON parent_children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage parent-child links"
  ON parent_children FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 2. MENTOR-STUDENT LINKS
-- =====================================================

CREATE TABLE IF NOT EXISTS mentor_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  mentoring_focus TEXT,
  meeting_frequency VARCHAR(50),
  last_meeting_date DATE,
  notes TEXT,
  
  UNIQUE(mentor_id, student_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_students_mentor ON mentor_students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_student ON mentor_students(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_active ON mentor_students(is_active);

ALTER TABLE mentor_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view their students"
  ON mentor_students FOR SELECT
  USING (mentor_id = auth.uid());

CREATE POLICY "Admins can manage mentor-student links"
  ON mentor_students FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 3. MENTORING NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS mentoring_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_student_id UUID NOT NULL REFERENCES mentor_students(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  duration_minutes INTEGER,
  topics_discussed TEXT,
  progress_notes TEXT,
  action_items TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_notes_mentor ON mentoring_notes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_notes_student ON mentoring_notes(student_id);

ALTER TABLE mentoring_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can manage their notes"
  ON mentoring_notes FOR ALL
  USING (mentor_id = auth.uid());

-- =====================================================
-- 4. PARENT NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS parent_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent ON parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_student ON parent_notifications(student_id);

ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their notifications"
  ON parent_notifications FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their notifications"
  ON parent_notifications FOR UPDATE
  USING (parent_id = auth.uid());

-- =====================================================
-- SUCCESS! Tables created.
-- =====================================================
-- To link users, run separate INSERT statements after this.
-- See PARENT_MENTOR_QUICK_SETUP.md for examples.
