-- Migration: Add Parent-Children Relationship Table
-- Run this in Supabase SQL Editor

-- Create parent_children relationship table
CREATE TABLE IF NOT EXISTS parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references profiles(id) on delete cascade not null,
  child_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  UNIQUE(parent_id, child_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS parent_children_parent_id_idx ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS parent_children_child_id_idx ON parent_children(child_id);

-- Enable RLS
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- Policies for parent_children
CREATE POLICY "Parents can view their own children"
  ON parent_children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can view all parent-children relationships"
  ON parent_children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

CREATE POLICY "Admins can manage parent-children relationships"
  ON parent_children FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
    )
  );

-- Verify the migration
SELECT 'Parent-Children table created successfully!' as status;
