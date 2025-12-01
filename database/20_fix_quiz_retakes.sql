-- Fix Quiz Retakes - Allow students to retake quizzes
-- Run this in Supabase SQL Editor

-- Option 1: Drop the unique constraint to allow multiple attempts
-- This keeps all attempts in history
ALTER TABLE quiz_rankings 
DROP CONSTRAINT IF EXISTS quiz_rankings_quiz_id_student_id_key;

-- Add a new unique constraint that includes attempt number or timestamp
-- This allows multiple attempts while preventing exact duplicates
ALTER TABLE quiz_rankings
ADD CONSTRAINT quiz_rankings_unique_attempt 
UNIQUE (quiz_id, student_id, submitted_at);

-- Option 2: If you want to keep only the best score, create a function
-- that updates existing ranking instead of inserting
CREATE OR REPLACE FUNCTION upsert_quiz_ranking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO quiz_rankings (
    quiz_id,
    student_id,
    score,
    percentage,
    time_taken_seconds,
    submitted_at,
    rank
  ) VALUES (
    NEW.quiz_id,
    NEW.student_id,
    NEW.score,
    NEW.percentage,
    NEW.time_taken_seconds,
    NEW.completed_at,
    0
  )
  ON CONFLICT (quiz_id, student_id)
  DO UPDATE SET
    score = CASE 
      WHEN EXCLUDED.score > quiz_rankings.score THEN EXCLUDED.score
      ELSE quiz_rankings.score
    END,
    percentage = CASE 
      WHEN EXCLUDED.score > quiz_rankings.score THEN EXCLUDED.percentage
      ELSE quiz_rankings.percentage
    END,
    time_taken_seconds = CASE 
      WHEN EXCLUDED.score > quiz_rankings.score THEN EXCLUDED.time_taken_seconds
      ELSE quiz_rankings.time_taken_seconds
    END,
    submitted_at = CASE 
      WHEN EXCLUDED.score > quiz_rankings.score THEN EXCLUDED.submitted_at
      ELSE quiz_rankings.submitted_at
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: If there's a trigger on quiz_results that creates quiz_rankings,
-- you may need to drop and recreate it with the upsert logic above

-- To find existing triggers:
-- SELECT * FROM information_schema.triggers WHERE event_object_table = 'quiz_results';

-- To drop a trigger if needed:
-- DROP TRIGGER IF EXISTS trigger_name ON quiz_results;
