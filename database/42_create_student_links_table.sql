-- Create student_links table for linking students with mentors and teachers

CREATE TABLE IF NOT EXISTS student_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade not null,
  mentor_id uuid references profiles(id) on delete set null,
  teacher_id uuid references profiles(id) on delete set null,
  link_type text not null check (link_type in ('mentor', 'teacher')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, mentor_id, link_type),
  UNIQUE(student_id, teacher_id, link_type)
);

-- Create indexes
CREATE INDEX student_links_student_id_idx ON student_links(student_id);
CREATE INDEX student_links_mentor_id_idx ON student_links(mentor_id);
CREATE INDEX student_links_teacher_id_idx ON student_links(teacher_id);

-- Enable RLS
ALTER TABLE student_links ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view links
CREATE POLICY "Users can view student links"
  ON student_links FOR SELECT
  USING (true);

-- Allow admins to create/update/delete links
CREATE POLICY "Admins can manage student links"
  ON student_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

SELECT 'Student links table created successfully!' as status;
