-- ============================================
-- FIX RLS POLICIES FOR LMS TABLES
-- Run this if you're getting RLS policy errors
-- ============================================

-- Fix recorded_videos policies
DROP POLICY IF EXISTS "Teachers can create recorded videos" ON recorded_videos;
CREATE POLICY "Teachers can create recorded videos"
  ON recorded_videos FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Fix video_lessons policies  
DROP POLICY IF EXISTS "Teachers can create video lessons" ON video_lessons;
CREATE POLICY "Teachers can create video lessons"
  ON video_lessons FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Fix live_classes policies
DROP POLICY IF EXISTS "Teachers can create live classes" ON live_classes;
CREATE POLICY "Teachers can create live classes"
  ON live_classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Fix quizzes policies
DROP POLICY IF EXISTS "Teachers can create quizzes" ON quizzes;
CREATE POLICY "Teachers can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Ensure students can view all content (not just their grade)
DROP POLICY IF EXISTS "Students can view recorded videos" ON recorded_videos;
CREATE POLICY "Students can view recorded videos"
  ON recorded_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Students can view video lessons" ON video_lessons;
CREATE POLICY "Students can view video lessons"
  ON video_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Students can view live classes" ON live_classes;
CREATE POLICY "Students can view live classes"
  ON live_classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

DROP POLICY IF EXISTS "Students can view quizzes" ON quizzes;
CREATE POLICY "Students can view quizzes"
  ON quizzes FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
