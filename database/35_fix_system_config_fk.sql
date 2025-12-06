-- Fix foreign key constraints in system_config tables to support cascade delete

-- Fix system_config table
ALTER TABLE system_config
DROP CONSTRAINT IF EXISTS system_config_updated_by_fkey;

ALTER TABLE system_config
ADD CONSTRAINT system_config_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix system_logs table
ALTER TABLE system_logs
DROP CONSTRAINT IF EXISTS system_logs_created_by_fkey;

ALTER TABLE system_logs
ADD CONSTRAINT system_logs_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Verify the constraints
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name IN ('system_config', 'system_logs')
AND constraint_name LIKE '%fkey%'
ORDER BY table_name, constraint_name;
