-- Create storage buckets for assignments
-- Run this in Supabase SQL Editor

-- Create bucket for assignment files (teacher uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for assignment submissions (student uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-submissions', 'assignment-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for assignment-files bucket
-- Allow teachers to upload files
CREATE POLICY "Teachers can upload assignment files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Allow everyone to view assignment files
CREATE POLICY "Anyone can view assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assignment-files');

-- Allow teachers to delete their own files
CREATE POLICY "Teachers can delete their own assignment files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Set up storage policies for assignment-submissions bucket
-- Allow students to upload submission files
CREATE POLICY "Students can upload submission files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);

-- Allow students to view their own submissions
CREATE POLICY "Students can view their own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow teachers to view all submissions
CREATE POLICY "Teachers can view all submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Allow students to update their own submissions
CREATE POLICY "Students can update their own submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);

-- Allow students to delete their own submissions
CREATE POLICY "Students can delete their own submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'student'
  )
);
