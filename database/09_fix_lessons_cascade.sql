-- Fix lessons table to have CASCADE delete on domain references
-- Run this in Supabase SQL Editor

-- Drop existing foreign key constraints if they exist
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_domain_id_fkey;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_department_id_fkey;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_sub_domain_id_fkey;
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_semester_id_fkey;

-- Re-add foreign key constraints with CASCADE delete
ALTER TABLE lessons
ADD CONSTRAINT lessons_domain_id_fkey 
FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE;

ALTER TABLE lessons
ADD CONSTRAINT lessons_department_id_fkey 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;

ALTER TABLE lessons
ADD CONSTRAINT lessons_sub_domain_id_fkey 
FOREIGN KEY (sub_domain_id) REFERENCES sub_domains(id) ON DELETE CASCADE;

ALTER TABLE lessons
ADD CONSTRAINT lessons_semester_id_fkey 
FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE;

SELECT 'Lessons cascade delete constraints updated successfully!' as status;
