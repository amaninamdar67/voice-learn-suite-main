-- ============================================
-- LMS Additional Schema - Recorded Videos & Quiz Rankings
-- ============================================

-- ============================================
-- 1. RECORDED VIDEOS TABLE (General Video Library)
-- ============================================
CREATE TABLE IF NOT EXISTS recorded_videos (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references auth.users not null,
  title text not null,
  description text,
  youtube_url text not null,
  youtube_video_id text not null,
  category text, -- 'tutorial', 'lecture', 'demonstration', 'review', etc.
  subject text,
  topic text,
  difficulty_level text, -- 'beginner', 'intermediate', 'advanced'
  grade text,
  duration_seconds integer,
  thumbnail_url text, -- Optional custom thumbnail
  is_featured boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX recorded_videos_teacher_id_idx ON recorded_videos(teacher_id);
CREATE INDEX recorded_videos_category_idx ON recorded_videos(category);
CREATE INDEX recorded_videos_subject_idx ON recorded_videos(subject);
CREATE INDEX recorded_videos_grade_idx ON recorded_videos(grade);
CREATE INDEX recorded_videos_featured_idx ON recorded_videos(is_featured);

-- ============================================
-- 2. VIDEO WATCH HISTORY (Track Recorded Video Views)
-- ============================================
CREATE TABLE IF NOT EXISTS video_watch_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  video_id uuid references recorded_videos(id) on delete cascade not null,
  watch_duration_seconds integer default 0,
  watch_percentage decimal(5,2) default 0,
  is_completed boolean default false, -- true if >= 80%
  last_watched_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, video_id)
);

CREATE INDEX video_watch_history_student_id_idx ON video_watch_history(student_id);
CREATE INDEX video_watch_history_video_id_idx ON video_watch_history(video_id);
CREATE INDEX video_watch_history_completed_idx ON video_watch_history(is_completed);

-- ============================================
-- 3. QUIZ RANKINGS TABLE (Leaderboard System)
-- ============================================
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

CREATE INDEX quiz_rankings_quiz_id_idx ON quiz_rankings(quiz_id);
CREATE INDEX quiz_rankings_student_id_idx ON quiz_rankings(student_id);
CREATE INDEX quiz_rankings_rank_idx ON quiz_rankings(quiz_id, rank);

-- ============================================
-- RLS POLICIES - RECORDED VIDEOS
-- ============================================
ALTER TABLE recorded_videos ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own videos
CREATE POLICY "Teachers can view own recorded videos"
  ON recorded_videos FOR SELECT
  USING (auth.uid() = teacher_id);

-- Students can view all published videos
CREATE POLICY "Students can view recorded videos"
  ON recorded_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'student'
    )
  );

-- Teachers can create videos
CREATE POLICY "Teachers can create recorded videos"
  ON recorded_videos FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update their own videos
CREATE POLICY "Teachers can update own recorded videos"
  ON recorded_videos FOR UPDATE
  USING (auth.uid() = teacher_id);

-- Teachers can delete their own videos
CREATE POLICY "Teachers can delete own recorded videos"
  ON recorded_videos FOR DELETE
  USING (auth.uid() = teacher_id);

-- Admins can view all videos
CREATE POLICY "Admins can view all recorded videos"
  ON recorded_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - VIDEO WATCH HISTORY
-- ============================================
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- Students can view their own watch history
CREATE POLICY "Students can view own video watch history"
  ON video_watch_history FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own watch history
CREATE POLICY "Students can track own video watch history"
  ON video_watch_history FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own watch history
CREATE POLICY "Students can update own video watch history"
  ON video_watch_history FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view watch history for their videos
CREATE POLICY "Teachers can view video watch history"
  ON video_watch_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recorded_videos
      WHERE recorded_videos.id = video_watch_history.video_id
      AND recorded_videos.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's watch history
CREATE POLICY "Parents can view children video watch history"
  ON video_watch_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = video_watch_history.student_id
    )
  );

-- Mentors can view their mentees' watch history
CREATE POLICY "Mentors can view mentee video watch history"
  ON video_watch_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = video_watch_history.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all watch history
CREATE POLICY "Admins can view all video watch history"
  ON video_watch_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - QUIZ RANKINGS
-- ============================================
ALTER TABLE quiz_rankings ENABLE ROW LEVEL SECURITY;

-- Students can view rankings for quizzes they've taken
CREATE POLICY "Students can view quiz rankings"
  ON quiz_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_rankings.quiz_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'student'
        AND profiles.grade = quizzes.grade
      )
    )
  );

-- System can insert rankings (via backend)
CREATE POLICY "System can create quiz rankings"
  ON quiz_rankings FOR INSERT
  WITH CHECK (true);

-- System can update rankings (via backend)
CREATE POLICY "System can update quiz rankings"
  ON quiz_rankings FOR UPDATE
  USING (true);

-- Teachers can view rankings for their quizzes
CREATE POLICY "Teachers can view quiz rankings"
  ON quiz_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_rankings.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

-- Parents can view their children's rankings
CREATE POLICY "Parents can view children quiz rankings"
  ON quiz_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
      AND parent_children.child_id = quiz_rankings.student_id
    )
  );

-- Mentors can view their mentees' rankings
CREATE POLICY "Mentors can view mentee quiz rankings"
  ON quiz_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = quiz_rankings.student_id
      AND profiles.mentor_id = auth.uid()
    )
  );

-- Admins can view all rankings
CREATE POLICY "Admins can view all quiz rankings"
  ON quiz_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update video view count
CREATE OR REPLACE FUNCTION increment_video_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recorded_videos
  SET view_count = view_count + 1
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment view count on new watch history
CREATE TRIGGER trigger_increment_video_views
  AFTER INSERT ON video_watch_history
  FOR EACH ROW
  EXECUTE FUNCTION increment_video_view_count();

-- Function to calculate and update quiz rankings
CREATE OR REPLACE FUNCTION update_quiz_rankings(p_quiz_id uuid)
RETURNS void AS $$
BEGIN
  -- Delete existing rankings for this quiz
  DELETE FROM quiz_rankings WHERE quiz_id = p_quiz_id;
  
  -- Insert new rankings based on score, time, and submission time
  INSERT INTO quiz_rankings (
    quiz_id, 
    student_id, 
    quiz_result_id, 
    rank, 
    score, 
    percentage, 
    time_taken_seconds, 
    submitted_at
  )
  SELECT 
    quiz_id,
    student_id,
    id as quiz_result_id,
    ROW_NUMBER() OVER (
      ORDER BY 
        score DESC, 
        time_taken_seconds ASC, 
        completed_at ASC
    ) as rank,
    score,
    percentage,
    time_taken_seconds,
    completed_at as submitted_at
  FROM quiz_results
  WHERE quiz_id = p_quiz_id
    AND is_completed = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update rankings when quiz result is inserted/updated
CREATE OR REPLACE FUNCTION trigger_update_quiz_rankings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true THEN
    PERFORM update_quiz_rankings(NEW.quiz_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_quiz_result_rankings
  AFTER INSERT OR UPDATE ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_quiz_rankings();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for top performers across all quizzes
CREATE OR REPLACE VIEW top_quiz_performers AS
SELECT 
  p.id as student_id,
  p.full_name,
  p.grade,
  COUNT(DISTINCT qr.quiz_id) as quizzes_taken,
  AVG(qr.percentage) as avg_percentage,
  SUM(CASE WHEN qrank.rank = 1 THEN 1 ELSE 0 END) as first_place_count,
  SUM(CASE WHEN qrank.rank <= 3 THEN 1 ELSE 0 END) as top_three_count
FROM profiles p
JOIN quiz_results qr ON qr.student_id = p.id AND qr.is_completed = true
LEFT JOIN quiz_rankings qrank ON qrank.quiz_result_id = qr.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.grade
ORDER BY avg_percentage DESC, first_place_count DESC;

-- View for video engagement statistics
CREATE OR REPLACE VIEW video_engagement_stats AS
SELECT 
  rv.id as video_id,
  rv.title,
  rv.subject,
  rv.category,
  rv.view_count,
  COUNT(vwh.id) as unique_viewers,
  AVG(vwh.watch_percentage) as avg_watch_percentage,
  COUNT(CASE WHEN vwh.is_completed = true THEN 1 END) as completion_count
FROM recorded_videos rv
LEFT JOIN video_watch_history vwh ON vwh.video_id = rv.id
GROUP BY rv.id, rv.title, rv.subject, rv.category, rv.view_count
ORDER BY rv.view_count DESC;
