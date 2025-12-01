-- Add edit/delete tracking to community posts and replies
-- Run this in Supabase SQL Editor

-- Add edited_at column to track edits
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

ALTER TABLE community_replies 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Update the update trigger to set edited_at
CREATE OR REPLACE FUNCTION update_community_edited_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.edited_at = NOW();
    NEW.is_edited = true;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_posts_edited_trigger ON community_posts;
CREATE TRIGGER community_posts_edited_trigger
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_community_edited_at();

DROP TRIGGER IF EXISTS community_replies_edited_trigger ON community_replies;
CREATE TRIGGER community_replies_edited_trigger
BEFORE UPDATE ON community_replies
FOR EACH ROW EXECUTE FUNCTION update_community_edited_at();

SELECT 'Community edit/delete tracking added successfully!' as status;
