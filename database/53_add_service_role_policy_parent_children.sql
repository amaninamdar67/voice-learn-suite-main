-- Add policy to allow service role to read parent_children
-- This allows the backend to fetch account linked counts

CREATE POLICY "Service role can read all parent-child links"
  ON parent_children FOR SELECT
  USING (true);
