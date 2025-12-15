-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if mentors exist
SELECT id, full_name, role FROM profiles WHERE role = 'mentor' LIMIT 5;

-- Check mentor-student links
SELECT COUNT(*) as total_links FROM mentor_student_links;
