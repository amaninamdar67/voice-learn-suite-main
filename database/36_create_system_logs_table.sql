-- Create system_logs table if it doesn't exist

CREATE TABLE IF NOT EXISTS system_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  description text,
  status text default 'pending',
  created_at timestamptz default now(),
  created_by uuid references profiles(id) ON DELETE SET NULL,
  completed_at timestamptz
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS system_logs_created_by_idx ON system_logs(created_by);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs(created_at);

-- Verify the table was created
SELECT 'system_logs table created successfully!' as status;
