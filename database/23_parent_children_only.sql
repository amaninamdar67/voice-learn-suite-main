-- Create parent_children table
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'parent',
  is_primary_contact BOOLEAN DEFAULT true,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_student ON parent_children(student_id);

ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children"
  ON parent_children FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage parent-child links"
  ON parent_children FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
