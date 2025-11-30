-- Create Storage Bucket for Lesson Files
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-files', 'lesson-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Teachers can upload lesson files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-files' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Anyone can view lesson files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lesson-files');

CREATE POLICY "Teachers can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Teachers can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

SELECT 'Storage bucket created successfully!' as status;
