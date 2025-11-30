-- Lessons Management Schema
-- Run this in Supabase SQL Editor

-- Create lessons table for study materials (PDFs, documents, notes)
CREATE TABLE lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  teacher_id uuid references auth.users not null,
  subject text not null,
  grade text,
  section text,
  document_url text, -- Supabase storage URL for PDF/document
  document_name text,
  document_type text, -- 'pdf', 'doc', 'ppt', 'txt'
  file_size integer, -- in bytes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
CREATE INDEX lessons_teacher_id_idx ON lessons(teacher_id);
CREATE INDEX lessons_grade_idx ON lessons(grade);
CREATE INDEX lessons_subject_idx ON lessons(subject);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policies
-- Teachers can view their own lessons
CREATE POLICY "Teachers can view own lessons"
  ON lessons FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view lessons for their grade
CREATE POLICY "Students can view lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
      AND grade = lessons.grade
    )
  );

-- Teachers can insert their own lessons
CREATE POLICY "Teachers can create lessons"
  ON lessons FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Teachers can update their own lessons
CREATE POLICY "Teachers can update own lessons"
  ON lessons FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own lessons
CREATE POLICY "Teachers can delete own lessons"
  ON lessons FOR DELETE
  USING (auth.uid() = teacher_id);

-- Admins can view all lessons
CREATE POLICY "Admins can view all lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
