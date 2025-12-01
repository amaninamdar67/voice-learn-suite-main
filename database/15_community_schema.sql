-- Community/Discussion Forum Schema
-- Run this in Supabase SQL Editor

-- Discussion posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anonymous_nickname VARCHAR(100),
  title VARCHAR(255),
  content TEXT NOT NULL,
  lesson_id UUID,
  subject VARCHAR(100),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('recorded-classes', 'courses', 'live-classes', 'general')),
  page_source VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT true,
  parent_visible BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Replies to posts
CREATE TABLE IF NOT EXISTS community_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anonymous_nickname VARCHAR(100),
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES community_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id),
  UNIQUE(reply_id, user_id),
  CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- Indexes
CREATE INDEX IF NOT EXISTS community_posts_user_idx ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_lesson_idx ON community_posts(lesson_id);
CREATE INDEX IF NOT EXISTS community_posts_created_idx ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_category_idx ON community_posts(category);
CREATE INDEX IF NOT EXISTS community_posts_page_source_idx ON community_posts(page_source);
CREATE INDEX IF NOT EXISTS community_replies_post_idx ON community_replies(post_id);
CREATE INDEX IF NOT EXISTS community_replies_user_idx ON community_replies(user_id);
CREATE INDEX IF NOT EXISTS community_likes_post_idx ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS community_likes_reply_idx ON community_likes(reply_id);

-- RLS Policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Posts policies
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
CREATE POLICY "Anyone can view posts" ON community_posts
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
CREATE POLICY "Users can create posts" ON community_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their posts" ON community_posts;
CREATE POLICY "Users can update their posts" ON community_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their posts" ON community_posts;
CREATE POLICY "Users can delete their posts" ON community_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Replies policies
DROP POLICY IF EXISTS "Anyone can view replies" ON community_replies;
CREATE POLICY "Anyone can view replies" ON community_replies
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create replies" ON community_replies;
CREATE POLICY "Users can create replies" ON community_replies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their replies" ON community_replies;
CREATE POLICY "Users can update their replies" ON community_replies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their replies" ON community_replies;
CREATE POLICY "Users can delete their replies" ON community_replies
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON community_likes;
CREATE POLICY "Anyone can view likes" ON community_likes
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can like posts/replies" ON community_likes;
CREATE POLICY "Users can like posts/replies" ON community_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts/replies" ON community_likes;
CREATE POLICY "Users can unlike posts/replies" ON community_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET replies_count = replies_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET replies_count = replies_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_reply_count_trigger ON community_replies;
CREATE TRIGGER update_post_reply_count_trigger
AFTER INSERT OR DELETE ON community_replies
FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.reply_id IS NOT NULL THEN
      UPDATE community_replies SET likes_count = likes_count + 1 WHERE id = NEW.reply_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.reply_id IS NOT NULL THEN
      UPDATE community_replies SET likes_count = likes_count - 1 WHERE id = OLD.reply_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_likes_count_trigger ON community_likes;
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON community_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

SELECT 'Community schema created successfully!' as status;
