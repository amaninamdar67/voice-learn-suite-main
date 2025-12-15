-- Fix Varun's role back to teacher
UPDATE profiles 
SET role = 'teacher' 
WHERE full_name = 'Prof Varun' OR full_name LIKE '%Varun%';
