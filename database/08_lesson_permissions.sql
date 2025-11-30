-- Add permission field to lessons table
-- Run this in Supabase SQL Editor

-- Add permission column
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS permission VARCHAR(20) DEFAULT 'view_only' CHECK (permission IN ('view_only', 'allow_download'));

-- Add max file size constraint (15MB = 15728640 bytes)
ALTER TABLE lessons 
ADD CONSTRAINT file_size_limit CHECK (file_size <= 15728640);

-- Add permanent flag (documents stay until teacher deletes)
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT true;

-- Add analyzed flag for AI processing
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS is_analyzed BOOLEAN DEFAULT false;

-- Add document analysis data
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS lessons_permission_idx ON lessons(permission);
CREATE INDEX IF NOT EXISTS lessons_is_analyzed_idx ON lessons(is_analyzed);

SELECT 'Lesson permissions schema updated successfully!' as status;
