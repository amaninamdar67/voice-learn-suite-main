-- System Configuration Table
-- Run this in Supabase SQL Editor

-- Create system_config table to store feature toggles
CREATE TABLE IF NOT EXISTS system_config (
  id uuid primary key default gen_random_uuid(),
  config_key text unique not null,
  config_value jsonb not null,
  description text,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

-- Insert default configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
  ('features', '{
    "chat": true,
    "aiTutor": true,
    "voiceNavigation": true,
    "discussions": true,
    "notifications": true,
    "videoLessons": true,
    "quizzes": true,
    "projects": true
  }'::jsonb, 'Feature toggles for the system'),
  ('maintenance_mode', 'false'::jsonb, 'System maintenance mode')
ON CONFLICT (config_key) DO NOTHING;

-- Create backups table to track backup history
CREATE TABLE IF NOT EXISTS system_backups (
  id uuid primary key default gen_random_uuid(),
  backup_name text not null,
  backup_size bigint,
  backup_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  created_by uuid references profiles(id),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;

-- Policies for system_config (only admins)
CREATE POLICY "Admins can view system config"
  ON system_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update system config"
  ON system_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for system_backups (only admins)
CREATE POLICY "Admins can view backups"
  ON system_backups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create backups"
  ON system_backups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_system_config_updated_at 
BEFORE UPDATE ON system_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'System configuration tables created successfully!' as status;
