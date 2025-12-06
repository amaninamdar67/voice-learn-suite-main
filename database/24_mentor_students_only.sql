-- Create mentor_students table
CREATE TABLE IF NOT EXISTS mentor_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  mentoring_focus TEXT,
  meeting_frequency VARCHAR(50),
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
