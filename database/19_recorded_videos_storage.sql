-- Create storage bucket for recorded videos
-- Run this in Supabase SQL Editor

-- Create bucket for recorded videos (teacher uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recorded-videos', 'recorded-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for recorded-videos bucket
-- Allow teachers to upload video files
CREATE POLICY "Teachers can upload recorded videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recorded-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Allow everyone to view recorded videos
CREATE POLICY "Anyone can view recorded videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recorded-videos');

-- Allow teachers to delete their own videos
CREATE POLICY "Teachers can delete their own recorded videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recorded-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);

-- Allow teachers to update their own videos
CREATE POLICY "Teachers can update their own recorded videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recorded-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'teacher'
  )
);
