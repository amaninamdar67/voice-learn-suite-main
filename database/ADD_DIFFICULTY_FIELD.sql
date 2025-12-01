-- Add difficulty field to video_lessons table
ALTER TABLE video_lessons 
ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));

-- Add default value for existing records
UPDATE video_lessons 
SET difficulty = 'beginner' 
WHERE difficulty IS NULL;
