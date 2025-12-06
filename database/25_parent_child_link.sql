-- Create parent_children linking table
-- Links parent profiles to student profiles

CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'parent',
  is_primary_contact BOOLEAN DEFAULT true,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Add foreign keys after table creation
ALTER TABLE parent_children 
  ADD CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE parent_children 
  ADD CONSTRAINT fk_child FOREIGN KEY (child_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child ON parent_children(child_id);

-- Enable RLS
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their children"
  ON parent_children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage parent-child links"
  ON parent_children FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
