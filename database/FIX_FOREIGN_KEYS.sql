-- ============================================
-- FIX FOREIGN KEY RELATIONSHIPS FOR LMS TABLES
-- This fixes the relationship between LMS tables and profiles
-- ============================================

-- First, drop existing foreign key constraints
ALTER TABLE video_lessons DROP CONSTRAINT IF EXISTS video_lessons_teacher_id_fkey;
ALTER TABLE live_classes DROP CONSTRAINT IF EXISTS live_classes_teacher_id_fkey;
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_teacher_id_fkey;
ALTER TABLE recorded_videos DROP CONSTRAINT IF EXISTS recorded_videos_teacher_id_fkey;

-- Now add them back referencing profiles instead of auth.users
ALTER TABLE video_lessons 
  ADD CONSTRAINT video_lessons_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE live_classes 
  ADD CONSTRAINT live_classes_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE quizzes 
  ADD CONSTRAINT quizzes_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE recorded_videos 
  ADD CONSTRAINT recorded_videos_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also fix student references in tracking tables
ALTER TABLE lesson_attendance DROP CONSTRAINT IF EXISTS lesson_attendance_student_id_fkey;
ALTER TABLE live_attendance DROP CONSTRAINT IF EXISTS live_attendance_student_id_fkey;
ALTER TABLE live_ping_responses DROP CONSTRAINT IF EXISTS live_ping_responses_student_id_fkey;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_student_id_fkey;
ALTER TABLE video_watch_history DROP CONSTRAINT IF EXISTS video_watch_history_student_id_fkey;
ALTER TABLE quiz_rankings DROP CONSTRAINT IF EXISTS quiz_rankings_student_id_fkey;

ALTER TABLE lesson_attendance 
  ADD CONSTRAINT lesson_attendance_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE live_attendance 
  ADD CONSTRAINT live_attendance_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE live_ping_responses 
  ADD CONSTRAINT live_ping_responses_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE quiz_results 
  ADD CONSTRAINT quiz_results_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE video_watch_history 
  ADD CONSTRAINT video_watch_history_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE quiz_rankings 
  ADD CONSTRAINT quiz_rankings_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix live_attendance_pings teacher reference
ALTER TABLE live_attendance_pings DROP CONSTRAINT IF EXISTS live_attendance_pings_teacher_id_fkey;
ALTER TABLE live_attendance_pings 
  ADD CONSTRAINT live_attendance_pings_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
