-- Fix foreign key constraints on assignments table to support cascade delete

-- Drop existing constraints
ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_department_id_fkey,
DROP CONSTRAINT IF EXISTS assignments_semester_id_fkey;

-- Add new constraints with ON DELETE CASCADE
ALTER TABLE assignments
ADD CONSTRAINT assignments_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD CONSTRAINT assignments_semester_id_fkey 
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL;

-- Verify the constraints
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'assignments' 
AND constraint_name LIKE '%fkey%'
ORDER BY constraint_name;
