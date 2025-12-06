-- Create mentor_students linking table
-- Links mentor profiles to student profiles

CREATE TABLE IF NOT EXISTS mentor_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  mentoring_focus TEXT,
  meeting_frequency VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- Add foreign keys after table creation
ALTER TABLE mentor_students 
  ADD CONSTRAINT fk_mentor FOREIGN KEY (mentor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE mentor_students 
  ADD CONSTRAINT fk_mentee FOREIGN KEY (mentee_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentor_students_mentor ON mentor_students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_mentee ON mentor_students(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_students_active ON mentor_students(is_active);

-- Enable RLS
ALTER TABLE mentor_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Mentors can view their students"
  ON mentor_students FOR SELECT
  USING (mentor_id = auth.uid());

CREATE POLICY "Admins can manage mentor-student links"
  ON mentor_students FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
