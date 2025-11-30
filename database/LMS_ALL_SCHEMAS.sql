-- ============================================
-- COMPLETE LMS DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: CORE CONTENT TABLES
-- ============================================

-- 1. VIDEO LESSONS TABLE
CREATE TABLE IF NOT EXISTS video_lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  youtube_url text not null,
  youtube_video_id text not null,
  subject text,
  grade text,
  section text,
  duration_seconds integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS video_lessons_teacher_id_idx ON video_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS video_lessons_grade_idx ON video_lessons(grade);
CREATE INDEX IF NOT EXISTS video_lessons_subject_idx ON video_lessons(subject);

-- 2. LIVE CLASSES TABLE
CREATE TABLE IF NOT EXISTS live_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  session_title text not null,
  description text,
  stream_url text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'upcoming',
  subject text,
  grade text,
  section text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS live_classes_teacher_id_idx ON live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS live_classes_status_idx ON live_classes(status);
CREATE INDEX IF NOT EXISTS live_classes_start_time_idx ON live_classes(start_time);

-- 3. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  subject text,
  grade text,
  section text,
  total_marks integer default 0,
  duration_minutes integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS quizzes_teacher_id_idx ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS quizzes_grade_idx ON quizzes(grade);
CREATE INDEX IF NOT EXISTS quizzes_is_active_idx ON quizzes(is_active);

-- 4. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null,
  marks integer default 1,
  question_order integer default 0,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS quiz_questions_quiz_id_idx ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_questions_order_idx ON quiz_questions(quiz_id, question_order);

-- ============================================
-- PART 2: TRACKING TABLES
-- ============================================

-- 5. LESSON ATTENDANCE
CREATE TABLE IF NOT EXISTS lesson_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  lesson_id uuid references video_lessons(id) on delete cascade not null,
  watch_duration_seconds integer default 0,
  watch_percentage decimal(5,2) default 0,
  is_completed boolean default false,
  last_watched_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS lesson_attendance_student_id_idx ON lesson_attendance(student_id);
CREATE INDEX IF NOT EXISTS lesson_attendance_lesson_id_idx ON lesson_attendance(lesson_id);

-- 6. LIVE ATTENDANCE
CREATE TABLE IF NOT EXISTS live_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  live_class_id uuid references live_classes(id) on delete cascade not null,
  joined_at timestamptz not null,
  left_at timestamptz,
  duration_seconds integer,
  is_present boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS live_attendance_student_id_idx ON live_attendance(student_id);
CREATE INDEX IF NOT EXISTS live_attendance_class_id_idx ON live_attendance(live_class_id);

-- 7. LIVE ATTENDANCE PINGS
CREATE TABLE IF NOT EXISTS live_attendance_pings (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references live_classes(id) on delete cascade not null,
  teacher_id uuid references auth.users not null,
  ping_sent_at timestamptz not null default now(),
  ping_expires_at timestamptz not null,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS live_pings_class_id_idx ON live_attendance_pings(live_class_id);

-- 8. LIVE PING RESPONSES
CREATE TABLE IF NOT EXISTS live_ping_responses (
  id uuid primary key default gen_random_uuid(),
  ping_id uuid references live_attendance_pings(id) on delete cascade not null,
  student_id uuid references auth.users not null,
  responded_at timestamptz,
  response_time_seconds integer,
  is_present boolean default false,
  device_info text,
  created_at timestamptz default now(),
  UNIQUE(ping_id, student_id)
);

CREATE INDEX IF NOT EXISTS live_ping_responses_ping_id_idx ON live_ping_responses(ping_id);
CREATE INDEX IF NOT EXISTS live_ping_responses_student_id_idx ON live_ping_responses(student_id);

-- 9. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score integer default 0,
  total_marks integer not null,
  percentage decimal(5,2) default 0,
  time_taken_seconds integer,
  answers jsonb,
  is_completed boolean default false,
  attempted_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS quiz_results_student_id_idx ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS quiz_results_quiz_id_idx ON quiz_results(quiz_id);

-- 10. RECORDED VIDEOS
CREATE TABLE IF NOT EXISTS recorded_videos (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  youtube_url text not null,
  youtube_video_id text not null,
  category text,
  subject text,
  topic text,
  difficulty_level text,
  grade text,
  duration_seconds integer,
  thumbnail_url text,
  is_featured boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS recorded_videos_teacher_id_idx ON recorded_videos(teacher_id);
CREATE INDEX IF NOT EXISTS recorded_videos_category_idx ON recorded_videos(category);

-- 11. VIDEO WATCH HISTORY
CREATE TABLE IF NOT EXISTS video_watch_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  video_id uuid references recorded_videos(id) on delete cascade not null,
  watch_duration_seconds integer default 0,
  watch_percentage decimal(5,2) default 0,
  is_completed boolean default false,
  last_watched_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, video_id)
);

CREATE INDEX IF NOT EXISTS video_watch_history_student_id_idx ON video_watch_history(student_id);
CREATE INDEX IF NOT EXISTS video_watch_history_video_id_idx ON video_watch_history(video_id);

-- 12. QUIZ RANKINGS
CREATE TABLE IF NOT EXISTS quiz_rankings (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  student_id uuid references auth.users not null,
  quiz_result_id uuid references quiz_results(id) on delete cascade not null,
  rank integer not null,
  score integer not null,
  percentage decimal(5,2) not null,
  time_taken_seconds integer not null,
  submitted_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX IF NOT EXISTS quiz_rankings_quiz_id_idx ON quiz_rankings(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_rankings_student_id_idx ON quiz_rankings(student_id);

-- ============================================
-- PART 3: RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_ping_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_rankings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Teachers can view own video lessons" ON video_lessons;
DROP POLICY IF EXISTS "Students can view video lessons" ON video_lessons;
DROP POLICY IF EXISTS "Teachers can create video lessons" ON video_lessons;
DROP POLICY IF EXISTS "Teachers can update own video lessons" ON video_lessons;
DROP POLICY IF EXISTS "Teachers can delete own video lessons" ON video_lessons;
DROP POLICY IF EXISTS "Admins can view all video lessons" ON video_lessons;

-- Video Lessons Policies
CREATE POLICY "Teachers can view own video lessons"
  ON video_lessons FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view video lessons"
  ON video_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Teachers can create video lessons"
  ON video_lessons FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own video lessons"
  ON video_lessons FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own video lessons"
  ON video_lessons FOR DELETE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all video lessons"
  ON video_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for other tables (simplified for brevity)
-- Add more policies as needed following the same pattern

-- ============================================
-- PART 4: FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update quiz rankings
CREATE OR REPLACE FUNCTION update_quiz_rankings(p_quiz_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM quiz_rankings WHERE quiz_id = p_quiz_id;
  
  INSERT INTO quiz_rankings (
    quiz_id, student_id, quiz_result_id, rank, score, percentage, time_taken_seconds, submitted_at
  )
  SELECT 
    quiz_id,
    student_id,
    id as quiz_result_id,
    ROW_NUMBER() OVER (ORDER BY score DESC, time_taken_seconds ASC, completed_at ASC) as rank,
    score,
    percentage,
    time_taken_seconds,
    completed_at as submitted_at
  FROM quiz_results
  WHERE quiz_id = p_quiz_id AND is_completed = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update rankings
CREATE OR REPLACE FUNCTION trigger_update_quiz_rankings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true THEN
    PERFORM update_quiz_rankings(NEW.quiz_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quiz_result_rankings ON quiz_results;
CREATE TRIGGER trigger_quiz_result_rankings
  AFTER INSERT OR UPDATE ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_quiz_rankings();

-- Function to increment video view count
CREATE OR REPLACE FUNCTION increment_video_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recorded_videos
  SET view_count = view_count + 1
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_video_views ON video_watch_history;
CREATE TRIGGER trigger_increment_video_views
  AFTER INSERT ON video_watch_history
  FOR EACH ROW
  EXECUTE FUNCTION increment_video_view_count();
