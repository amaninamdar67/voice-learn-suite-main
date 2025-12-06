-- Add sub_domain_id to departments and semesters tables
-- This ensures departments and semesters are isolated per sub_domain

-- Add sub_domain_id to departments
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS sub_domain_id uuid references sub_domains on delete cascade;

-- Add sub_domain_id to semesters
ALTER TABLE semesters 
ADD COLUMN IF NOT EXISTS sub_domain_id uuid references sub_domains on delete cascade;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS departments_sub_domain_id_idx ON departments(sub_domain_id);
CREATE INDEX IF NOT EXISTS semesters_sub_domain_id_idx ON semesters(sub_domain_id);

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
