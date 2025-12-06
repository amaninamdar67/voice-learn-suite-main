-- Fix sub_domain_id foreign key on assignments table

-- Drop existing constraint
ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_sub_domain_id_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE assignments
ADD CONSTRAINT assignments_sub_domain_id_fkey 
  FOREIGN KEY (sub_domain_id) REFERENCES sub_domains(id) ON DELETE SET NULL;

-- Also fix domain_id if needed
ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_domain_id_fkey;

ALTER TABLE assignments
ADD CONSTRAINT assignments_domain_id_fkey 
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL;

-- Verify the constraints
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'assignments' 
AND constraint_name LIKE '%fkey%'
ORDER BY constraint_name;
