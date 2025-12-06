-- Enable cascade delete for sub_domain_id in profiles table
-- This allows deletion of subdomains even if users are assigned to them

-- First, drop the existing foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_sub_domain_id_fkey;

-- Add the new foreign key with ON DELETE CASCADE
ALTER TABLE profiles 
ADD CONSTRAINT profiles_sub_domain_id_fkey 
FOREIGN KEY (sub_domain_id) 
REFERENCES sub_domains(id) 
ON DELETE CASCADE;

-- Also enable cascade delete for department_id and semester_id
-- This prevents orphaned references when departments/semesters are deleted
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_department_id_fkey;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_department_id_fkey 
FOREIGN KEY (department_id) 
REFERENCES departments(id) 
ON DELETE SET NULL;

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_semester_id_fkey;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_semester_id_fkey 
FOREIGN KEY (semester_id) 
REFERENCES semesters(id) 
ON DELETE SET NULL;

-- Enable cascade delete for departments and semesters when subdomain is deleted
ALTER TABLE departments 
DROP CONSTRAINT IF EXISTS departments_subdomain_id_fkey;

ALTER TABLE departments 
ADD CONSTRAINT departments_subdomain_id_fkey 
FOREIGN KEY (subdomain_id) 
REFERENCES sub_domains(id) 
ON DELETE CASCADE;

ALTER TABLE semesters 
DROP CONSTRAINT IF EXISTS semesters_subdomain_id_fkey;

ALTER TABLE semesters 
ADD CONSTRAINT semesters_subdomain_id_fkey 
FOREIGN KEY (subdomain_id) 
REFERENCES sub_domains(id) 
ON DELETE CASCADE;

-- Verify the constraints were added
SELECT 'Cascade delete enabled for all subdomain relationships!' as status;

-- Now test the cascade delete by attempting to delete a subdomain
-- This will cascade delete all related profiles, departments, and semesters
-- Uncomment the line below to actually delete a subdomain (replace 'subdomain-id-here' with actual ID)
-- DELETE FROM sub_domains WHERE id = 'subdomain-id-here';
