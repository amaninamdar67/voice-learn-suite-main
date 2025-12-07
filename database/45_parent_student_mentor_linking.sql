-- Parent-Student Linking Table
CREATE TABLE parent_student_links (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship VARCHAR(50), -- 'mother', 'father', 'guardian', 'other'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX idx_parent_student_parent ON parent_student_links(parent_id);
CREATE INDEX idx_parent_student_student ON parent_student_links(student_id);

-- Parent-Mentor Linking Table
CREATE TABLE parent_mentor_links (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, mentor_id, student_id)
);

CREATE INDEX idx_parent_mentor_parent ON parent_mentor_links(parent_id);
CREATE INDEX idx_parent_mentor_mentor ON parent_mentor_links(mentor_id);
CREATE INDEX idx_parent_mentor_student ON parent_mentor_links(student_id);

-- Enable RLS
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_mentor_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_student_links
CREATE POLICY "Admins can manage parent-student links" ON parent_student_links
  FOR ALL USING (true);

-- RLS Policies for parent_mentor_links
CREATE POLICY "Admins can manage parent-mentor links" ON parent_mentor_links
  FOR ALL USING (true);
