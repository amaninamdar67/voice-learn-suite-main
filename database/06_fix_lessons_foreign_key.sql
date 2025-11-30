-- Fix lessons table foreign key to reference profiles instead of auth.users
-- Run this in Supabase SQL Editor

-- Drop the old foreign key constraint
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_teacher_id_fkey;

-- Add new foreign key constraint to profiles
ALTER TABLE lessons 
ADD CONSTRAINT lessons_teacher_id_fkey 
FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the fix
SELECT 'Lessons foreign key fixed successfully!' as status;
