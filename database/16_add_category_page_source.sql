-- Add category and page_source columns to community_posts
-- Run this in Supabase SQL Editor

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE community_posts 
    ADD COLUMN category VARCHAR(50) DEFAULT 'general' 
    CHECK (category IN ('recorded-classes', 'courses', 'live-classes', 'general'));
  END IF;
END $$;

-- Add page_source column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_posts' AND column_name = 'page_source'
  ) THEN
    ALTER TABLE community_posts 
    ADD COLUMN page_source VARCHAR(100);
  END IF;
END $$;

-- Create index for category if it doesn't exist
CREATE INDEX IF NOT EXISTS community_posts_category_idx ON community_posts(category);

-- Create index for page_source if it doesn't exist
CREATE INDEX IF NOT EXISTS community_posts_page_source_idx ON community_posts(page_source);

-- Add comments
COMMENT ON COLUMN community_posts.category IS 'Category for filtering: recorded-classes, courses, live-classes, general';
COMMENT ON COLUMN community_posts.page_source IS 'Source page where comment was posted: Course Library, Recorded Classes, etc.';

SELECT 'Category and page_source columns added successfully!' as status;
