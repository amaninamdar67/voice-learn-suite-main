-- ============================================
-- LMS Tracking & Analytics Schema
-- ============================================

-- ============================================
-- 1. LESSON ATTENDANCE (Video Watch Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  lesson_id uuid references video_lessons(id) on delete cascade not null,
  watch_duration_seconds integer default 0,
  watch_percentage decimal(5,2) default 0, -- 0.00 to 100.00
  is_completed boolean default false, -- true if >= 80%
  last_watched_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX lesson_attendance_student_id_idx ON lesson_attendance(student_id);
CREATE INDEX lesson_attendance_lesson_id_idx ON lesson_attendance(lesson_id);
CREATE INDEX lesson_attendance_completed_idx ON lesson_attendance(is_completed);

-- ============================================
-- 2. LIVE ATTENDANCE (Join/Leave Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS live_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  live_class_id uuid references live_classes(id) on delete cascade not null,
  joined_at timestamptz not null,
  left_at timestamptz,
  duration_seconds integer, -- calculated when left
  is_present boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX live_attendance_student_id_idx ON live_attendance(student_id);
CREATE INDEX live_attendance_class_id_idx ON live_attendance(live_class_id);
CREATE INDEX live_attendance_joined_idx ON live_attendance(joined_at);

-- ============================================
-- 3. LIVE ATTENDANCE PINGS (Attentiveness Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS live_attendance_pings (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references live_classes(id) on delete cascade not null,
  teacher_id uuid references auth.users not null,
  ping_sent_at timestamptz not null default now(),
  ping_expires_at timestamptz not null, -- 60 seconds after sent
  created_at timestamptz default now()
);

CREATE INDEX live_pings_class_id_idx ON live_attendance_pings(live_class_id);
CREATE INDEX live_pings_sent_at_idx ON live_attendance_pings(ping_sent_at);

-- ============================================
-- 4. LIVE PING RESPONSES (Student Responses)
-- ============================================
CREATE TABLE IF NOT EXISTS live_ping_responses (
  id uuid primary key default gen_random_uuid(),
  ping_id uuid references live_attendance_pings(id) on delete cascade not null,
  student_id uuid references auth.users not null,
  responded_at timestamptz,
  response_time_seconds integer, -- time taken to respond
  is_present boolean default false, -- true if responded in time
  device_info text, -- optional: browser/device info
  created_at timestamptz default now(),
  UNIQUE(ping_id, student_id)
);

CREATE INDEX live_ping_responses_ping_id_idx ON live_ping_responses(ping_id);
CREATE INDEX live_ping_responses_student_id_idx ON live_ping_responses(student_id);
CREATE INDEX live_ping_responses_present_idx ON live_ping_responses(is_present);

-- ============================================
-- 5. QUIZ RESULTS (Student Quiz Attempts)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score integer default 0,
  total_marks integer not null,
  percentage decimal(5,2) default 0,
  time_taken_seconds integer,
  answers jsonb, -- Store student answers: {"question_id": "selected_option"}
  is_completed boolean default false,
  attempted_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

CREATE INDEX quiz_results_student_id_idx ON quiz_results(student_id);
CREATE INDEX quiz_results_quiz_id_idx ON quiz_results(quiz_id);
CREATE INDEX quiz_results_completed_idx ON quiz_results(is_completed);
CREATE INDEX quiz_results_attempted_at_idx ON quiz_results(attempted_at);

-- ============================================
-- RLS POLICIES - LESSON ATTENDANCE
-- ============================================
ALTER TABLE lesson_attendance ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
CREATE POLICY "Students can view own lesson attendance"
  ON lesson_attendance FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own attendance
CREATE POLICY "Students can track own lesson attendance"
  ON lesson_attendance FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own attendance
CREATE POLICY "Students can update own lesson attendance"
  ON lesson_attendance FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view attendance for their lessons
CREATE POLICY "Teachers can view lesson attendance"
  ON lesson_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_lessons
      WHERE video_lessons.id = lesson_attendance.lesson_id
      AND video_lessons.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's attendance
CREATE POLICY "Parents can view children lesson attendance"
  ON lesson_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = lesson_attendance.student_id
    )
  );

-- Mentors can view their mentees' attendance
CREATE POLICY "Mentors can view mentee lesson attendance"
  ON lesson_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = lesson_attendance.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all attendance
CREATE POLICY "Admins can view all lesson attendance"
  ON lesson_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - LIVE ATTENDANCE
-- ============================================
ALTER TABLE live_attendance ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance
CREATE POLICY "Students can view own live attendance"
  ON live_attendance FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own attendance
CREATE POLICY "Students can track own live attendance"
  ON live_attendance FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own attendance
CREATE POLICY "Students can update own live attendance"
  ON live_attendance FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view attendance for their classes
CREATE POLICY "Teachers can view live attendance"
  ON live_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM live_classes
      WHERE live_classes.id = live_attendance.live_class_id
      AND live_classes.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's attendance
CREATE POLICY "Parents can view children live attendance"
  ON live_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = live_attendance.student_id
    )
  );

-- Mentors can view their mentees' attendance
CREATE POLICY "Mentors can view mentee live attendance"
  ON live_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = live_attendance.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all attendance
CREATE POLICY "Admins can view all live attendance"
  ON live_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - LIVE ATTENDANCE PINGS
-- ============================================
ALTER TABLE live_attendance_pings ENABLE ROW LEVEL SECURITY;

-- Teachers can create pings for their classes
CREATE POLICY "Teachers can create attendance pings"
  ON live_attendance_pings FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM live_classes
      WHERE live_classes.id = live_attendance_pings.live_class_id
      AND live_classes.teacher_id = auth.uid()
    )
  );

-- Teachers can view pings for their classes
CREATE POLICY "Teachers can view attendance pings"
  ON live_attendance_pings FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view pings for classes they're attending
CREATE POLICY "Students can view attendance pings"
  ON live_attendance_pings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM live_attendance
      WHERE live_attendance.live_class_id = live_attendance_pings.live_class_id
      AND live_attendance.student_id = auth.uid()
      AND live_attendance.left_at IS NULL -- still in class
    )
  );

-- Admins can view all pings
CREATE POLICY "Admins can view all attendance pings"
  ON live_attendance_pings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - LIVE PING RESPONSES
-- ============================================
ALTER TABLE live_ping_responses ENABLE ROW LEVEL SECURITY;

-- Students can view their own responses
CREATE POLICY "Students can view own ping responses"
  ON live_ping_responses FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own responses
CREATE POLICY "Students can respond to pings"
  ON live_ping_responses FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Teachers can view responses for their pings
CREATE POLICY "Teachers can view ping responses"
  ON live_ping_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM live_attendance_pings
      WHERE live_attendance_pings.id = live_ping_responses.ping_id
      AND live_attendance_pings.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's responses
CREATE POLICY "Parents can view children ping responses"
  ON live_ping_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = live_ping_responses.student_id
    )
  );

-- Mentors can view their mentees' responses
CREATE POLICY "Mentors can view mentee ping responses"
  ON live_ping_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = live_ping_responses.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all responses
CREATE POLICY "Admins can view all ping responses"
  ON live_ping_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - QUIZ RESULTS
-- ============================================
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Students can view their own results
CREATE POLICY "Students can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own results
CREATE POLICY "Students can submit quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own results (for incomplete attempts)
CREATE POLICY "Students can update own quiz results"
  ON quiz_results FOR UPDATE
  USING (auth.uid() = student_id AND is_completed = false);

-- Teachers can view results for their quizzes
CREATE POLICY "Teachers can view quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_results.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's results
CREATE POLICY "Parents can view children quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = quiz_results.student_id
    )
  );

-- Mentors can view their mentees' results
CREATE POLICY "Mentors can view mentee quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = quiz_results.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all results
CREATE POLICY "Admins can view all quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
