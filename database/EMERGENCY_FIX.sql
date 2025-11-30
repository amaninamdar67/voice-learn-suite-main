-- ============================================
-- EMERGENCY FIX - Disable RLS temporarily to test
-- ============================================

-- Temporarily disable RLS on all LMS tables for testing
ALTER TABLE video_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance_pings DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_ping_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_rankings DISABLE ROW LEVEL SECURITY;

-- This will allow all authenticated users to access everything
-- Use this ONLY for testing, then re-enable RLS with proper policies
