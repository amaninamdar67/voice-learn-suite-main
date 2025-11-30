-- Migration: Add Semesters Table and Update Schema
-- Run this in Supabase SQL Editor if domains table already exists

-- Create semesters table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS semesters (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains on delete cascade not null,
  department_id uuid references departments on delete cascade,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(domain_id, department_id, name)
);

-- Add semester_id to profiles table (only if column doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'semester_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN semester_id uuid references semesters;
  END IF;
END $$;

-- Add semester_id to lessons table (only if column doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'semester_id'
  ) THEN
    ALTER TABLE lessons ADD COLUMN semester_id uuid references semesters;
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS profiles_semester_id_idx ON profiles(semester_id);
CREATE INDEX IF NOT EXISTS semesters_domain_id_idx ON semesters(domain_id);
CREATE INDEX IF NOT EXISTS semesters_department_id_idx ON semesters(department_id);
CREATE INDEX IF NOT EXISTS lessons_semester_id_idx ON lessons(semester_id);

-- Enable RLS on semesters table
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Super admins can view all semesters" ON semesters;
DROP POLICY IF EXISTS "Super admins can create semesters" ON semesters;
DROP POLICY IF EXISTS "Super admins can update semesters" ON semesters;
DROP POLICY IF EXISTS "Super admins can delete semesters" ON semesters;

-- Policies for semesters (only super admin can manage)
CREATE POLICY "Super admins can view all semesters"
  ON semesters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can create semesters"
  ON semesters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update semesters"
  ON semesters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete semesters"
  ON semesters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Create trigger for updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_semesters_updated_at ON semesters;
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('domains', 'departments', 'sub_domains', 'semesters')
ORDER BY tabl