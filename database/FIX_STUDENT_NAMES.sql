-- Fix student names in leaderboard
-- This script checks and fixes the relationship between quiz_rankings and profiles

-- 1. Check if student_id in quiz_rankings exists in profiles
SELECT 
  qr.student_id,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING IN PROFILES'
    ELSE 'EXISTS'
  END as status
FROM quiz_rankings qr
LEFT JOIN profiles p ON qr.student_id = p.id;

-- 2. If profiles are missing, check auth.users
SELECT 
  qr.student_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as name_from_auth
FROM quiz_rankings qr
LEFT JOIN auth.users u ON qr.student_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = qr.student_id
);

-- 3. Create missing profiles from auth.users if needed
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'student',
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 4. Verify the fix
SELECT 
  qr.rank,
  p.full_name,
  qr.score,
  qr.percentage
FROM quiz_rankings qr
JOIN profiles p ON qr.student_id = p.id
ORDER BY qr.rank;
