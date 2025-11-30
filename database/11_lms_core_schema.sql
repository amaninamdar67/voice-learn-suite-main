-- ============================================
-- LMS Core Schema - Video Lessons, Live Classes, Quizzes
-- ============================================

-- ============================================
-- 1. VIDEO LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS video_lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  youtube_url text not null, -- Full YouTube URL
  youtube_video_id text not null, -- Extracted video ID
  subject text,
  grade text,
  section text,
  duration_seconds integer, -- Optional: video duration
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX video_lessons_teacher_id_idx ON video_lessons(teacher_id);
CREATE INDEX video_lessons_grade_idx ON video_lessons(grade);
CREATE INDEX video_lessons_subject_idx ON video_lessons(subject);

-- ============================================
-- 2. LIVE CLASSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  session_title text not null,
  description text,
  stream_url text not null, -- YouTube Live or RTMP URL
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'upcoming', -- 'upcoming', 'live', 'ended'
  subject text,
  grade text,
  section text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX live_classes_teacher_id_idx ON live_classes(teacher_id);
CREATE INDEX live_classes_status_idx ON live_classes(status);
CREATE INDEX live_classes_start_time_idx ON live_classes(start_time);

-- ============================================
-- 3. QUIZZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  subject text,
  grade text,
  section text,
  total_marks integer default 0,
  duration_minutes integer, -- Optional: time limit
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX quizzes_teacher_id_idx ON quizzes(teacher_id);
CREATE INDEX quizzes_grade_idx ON quizzes(grade);
CREATE INDEX quizzes_is_active_idx ON quizzes(is_active);

-- ============================================
-- 4. QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null, -- 'A', 'B', 'C', or 'D'
  marks integer default 1,
  question_order integer default 0,
  created_at timestamptz default now()
);

CREATE INDEX quiz_questions_quiz_id_idx ON quiz_questions(quiz_id);
CREATE INDEX quiz_questions_order_idx ON quiz_questions(quiz_id, question_order);

-- ============================================
-- RLS POLICIES - VIDEO LESSONS
-- ============================================
ALTER TABLE video_lessons ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own lessons
CREATE POLICY "Teachers can view own video lessons"
  ON video_lessons FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view lessons for their grade
CREATE POLICY "Students can view video lessons"
  ON video_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
      AND grade = video_lessons.grade
    )
  );

-- Teachers can create lessons
CREATE POLICY "Teachers can create video lessons"
  ON video_lessons FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update their own lessons
CREATE POLICY "Teachers can update own video lessons"
  ON video_lessons FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own lessons
CREATE POLICY "Teachers can delete own video lessons"
  ON video_lessons FOR DELETE
  USING (auth.uid() = teacher_id);

-- Admins can view all lessons
CREATE POLICY "Admins can view all video lessons"
  ON video_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - LIVE CLASSES
-- ============================================
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own classes
CREATE POLICY "Teachers can view own live classes"
  ON live_classes FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view classes for their grade
CREATE POLICY "Students can view live classes"
  ON live_classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
      AND grade = live_classes.grade
    )
  );

-- Teachers can create classes
CREATE POLICY "Teachers can create live classes"
  ON live_classes FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update their own classes
CREATE POLICY "Teachers can update own live classes"
  ON live_classes FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own classes
CREATE POLICY "Teachers can delete own live classes"
  ON live_classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- Admins can view all classes
CREATE POLICY "Admins can view all live classes"
  ON live_classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - QUIZZES
-- ============================================
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own quizzes
CREATE POLICY "Teachers can view own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view active quizzes for their grade
CREATE POLICY "Students can view quizzes"
  ON quizzes FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
      AND grade = quizzes.grade
    )
  );

-- Teachers can create quizzes
CREATE POLICY "Teachers can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update their own quizzes
CREATE POLICY "Teachers can update own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own quizzes
CREATE POLICY "Teachers can delete own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = teacher_id);

-- Admins can view all quizzes
CREATE POLICY "Admins can view all quizzes"
  ON quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - QUIZ QUESTIONS
-- ============================================
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Teachers can view questions for their quizzes
CREATE POLICY "Teachers can view own quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Students can view questions for active quizzes in their grade
CREATE POLICY "Students can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN profiles p ON p.id = auth.uid()
      WHERE q.id = quiz_questions.quiz_id
      AND q.is_active = true
      AND q.grade = p.grade
      AND p.role = 'student'
    )
  );

-- Teachers can create questions for their quizzes
CREATE POLICY "Teachers can create quiz questions"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Teachers can update questions for their quizzes
CREATE POLICY "Teachers can update quiz questions"
  ON quiz_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Teachers can delete questions for their quizzes
CREATE POLICY "Teachers can delete quiz questions"
  ON quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Admins can view all questions
CREATE POLICY "Admins can view all quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
