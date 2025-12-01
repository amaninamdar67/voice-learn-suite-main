-- Assignments System Schema
-- Run this in Supabase SQL Editor

-- Assignments table (created by teachers)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  grade VARCHAR(20),
  section VARCHAR(20),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_marks INTEGER DEFAULT 100,
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  domain_id UUID REFERENCES domains(id),
  sub_domain_id UUID REFERENCES sub_domains(id),
  department_id UUID REFERENCES departments(id),
  semester_id UUID REFERENCES semesters(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  marks_obtained INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS assignments_teacher_idx ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON assignments(due_date);
CREATE INDEX IF NOT EXISTS assignment_submissions_assignment_idx ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_student_idx ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_status_idx ON assignment_submissions(status);

-- RLS Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments policies
DROP POLICY IF EXISTS "Teachers can create assignments" ON assignments;
CREATE POLICY "Teachers can create assignments" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their assignments" ON assignments;
CREATE POLICY "Teachers can update their assignments" ON assignments
  FOR UPDATE TO authenticated
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their assignments" ON assignments;
CREATE POLICY "Teachers can delete their assignments" ON assignments
  FOR DELETE TO authenticated
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Everyone can view assignments" ON assignments;
CREATE POLICY "Everyone can view assignments" ON assignments
  FOR SELECT TO authenticated
  USING (true);

-- Submission policies
DROP POLICY IF EXISTS "Students can submit assignments" ON assignment_submissions;
CREATE POLICY "Students can submit assignments" ON assignment_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update their submissions" ON assignment_submissions;
CREATE POLICY "Students can update their submissions" ON assignment_submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Everyone can view submissions" ON assignment_submissions;
CREATE POLICY "Everyone can view submissions" ON assignment_submissions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Teachers can grade submissions" ON assignment_submissions;
CREATE POLICY "Teachers can grade submissions" ON assignment_submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_submissions.assignment_id
      AND assignments.teacher_id = auth.uid()
    )
  );

SELECT 'Assignments schema created successfully!' as status;
