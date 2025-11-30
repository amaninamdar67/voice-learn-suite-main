-- Multi-Tenancy Domain Management Schema
-- Run this in Supabase SQL Editor

-- Create domains table (Organizations/Schools/Colleges)
CREATE TABLE domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create departments table (Computer Science, Commerce, etc.)
CREATE TABLE departments (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(domain_id, name)
);

-- Create sub_domains table (Primary School / High School / College / UG / PG / PhD)
CREATE TABLE sub_domains (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains on delete cascade not null,
  name text not null,
  description text,
  type text default 'primary', -- 'primary', 'high', 'college', 'ug', 'pg', 'phd', 'other'
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(domain_id, name)
);

-- Create semesters table
CREATE TABLE semesters (
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

-- Add domain fields to profiles table
ALTER TABLE profiles 
ADD COLUMN domain_id uuid references domains,
ADD COLUMN department_id uuid references departments,
ADD COLUMN sub_domain_id uuid references sub_domains,
ADD COLUMN semester_id uuid references semesters,
ADD COLUMN is_super_admin boolean default false;

-- Create indexes for performance
CREATE INDEX profiles_domain_id_idx ON profiles(domain_id);
CREATE INDEX profiles_department_id_idx ON profiles(department_id);
CREATE INDEX profiles_sub_domain_id_idx ON profiles(sub_domain_id);
CREATE INDEX profiles_semester_id_idx ON profiles(semester_id);
CREATE INDEX departments_domain_id_idx ON departments(domain_id);
CREATE INDEX sub_domains_domain_id_idx ON sub_domains(domain_id);
CREATE INDEX semesters_domain_id_idx ON semesters(domain_id);
CREATE INDEX semesters_department_id_idx ON semesters(department_id);

-- Update lessons table to include domain isolation
ALTER TABLE lessons
ADD COLUMN domain_id uuid references domains,
ADD COLUMN department_id uuid references departments,
ADD COLUMN sub_domain_id uuid references sub_domains,
ADD COLUMN semester_id uuid references semesters;

CREATE INDEX lessons_domain_id_idx ON lessons(domain_id);
CREATE INDEX lessons_department_id_idx ON lessons(department_id);
CREATE INDEX lessons_sub_domain_id_idx ON lessons(sub_domain_id);
CREATE INDEX lessons_semester_id_idx ON lessons(semester_id);

-- Enable RLS on new tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_domains ENABLE ROW LEVEL SECURITY;

-- Policies for domains (only super admin can manage)
CREATE POLICY "Super admins can view all domains"
  ON domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can create domains"
  ON domains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update domains"
  ON domains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete domains"
  ON domains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Policies for departments (only super admin can manage)
CREATE POLICY "Super admins can view all departments"
  ON departments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can create departments"
  ON departments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update departments"
  ON departments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete departments"
  ON departments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Policies for sub_domains (only super admin can manage)
CREATE POLICY "Super admins can view all sub_domains"
  ON sub_domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can create sub_domains"
  ON sub_domains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update sub_domains"
  ON sub_domains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete sub_domains"
  ON sub_domains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Enable RLS on semesters table
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

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

-- Update lessons policies to enforce domain isolation
DROP POLICY IF EXISTS "Students can view lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers can view own lessons" ON lessons;

CREATE POLICY "Users can view lessons in their domain"
  ON lessons FOR SELECT
  USING (
    domain_id IN (
      SELECT domain_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create lessons in their domain"
  ON lessons FOR INSERT
  WITH CHECK (
    domain_id IN (
      SELECT domain_id FROM profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_domains_updated_at BEFORE UPDATE ON sub_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a default domain for existing data
INSERT INTO domains (name, description) 
VALUES ('Default Organization', 'Initial domain for existing users')
ON CONFLICT DO NOTHING;

-- Update existing profiles to use default domain
UPDATE profiles 
SET domain_id = (SELECT id FROM domains WHERE name = 'Default Organization' LIMIT 1)
WHERE domain_id IS NULL;

-- Make your admin a super admin (replace with your admin user ID)
-- UPDATE profiles SET is_super_admin = true WHERE email = 'admin@test.com';
