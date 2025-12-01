-- ============================================
-- Add Super Admin Role (Simple Version)
-- ============================================

-- This migration adds super admin functionality without modifying enums
-- Works with text-based role columns

-- Add is_super_admin flag to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster super admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin 
ON profiles(is_super_admin) 
WHERE is_super_admin = TRUE;

-- Update the first admin user to be super admin
DO $$
DECLARE
  first_admin_id UUID;
  first_admin_name TEXT;
BEGIN
  -- Get the first admin user (by creation date)
  SELECT id, full_name INTO first_admin_id, first_admin_name
  FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Mark them as super admin
  IF first_admin_id IS NOT NULL THEN
    UPDATE profiles
    SET is_super_admin = TRUE
    WHERE id = first_admin_id;
    
    RAISE NOTICE 'Marked user % (ID: %) as super admin', first_admin_name, first_admin_id;
  ELSE
    RAISE NOTICE 'No admin users found to mark as super admin';
  END IF;
END $$;

-- Add comment explaining the super admin role
COMMENT ON COLUMN profiles.is_super_admin IS 'Super admins have elevated privileges: can delete other admins, manage system-wide settings, etc.';

-- Create a function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND (role = 'super_admin' OR is_super_admin = TRUE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon;

-- Display super admin info
DO $$
DECLARE
  super_admin_count INTEGER;
  super_admin_info TEXT;
BEGIN
  SELECT COUNT(*), STRING_AGG(full_name, ', ')
  INTO super_admin_count, super_admin_info
  FROM profiles
  WHERE is_super_admin = TRUE OR role = 'super_admin';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Super Admin Setup Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Super Admins: %', COALESCE(super_admin_count, 0);
  IF super_admin_info IS NOT NULL THEN
    RAISE NOTICE 'Super Admins: %', super_admin_info;
  END IF;
  RAISE NOTICE '========================================';
END $$;

-- Instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'To manually assign super admin status by name:';
  RAISE NOTICE 'UPDATE profiles SET is_super_admin = TRUE WHERE full_name = ''Admin User'';';
  RAISE NOTICE '';
  RAISE NOTICE 'To manually assign super admin status by ID:';
  RAISE NOTICE 'UPDATE profiles SET is_super_admin = TRUE WHERE id = ''user-uuid-here'';';
  RAISE NOTICE '';
  RAISE NOTICE 'To remove super admin status:';
  RAISE NOTICE 'UPDATE profiles SET is_super_admin = FALSE WHERE full_name = ''User Name'';';
  RAISE NOTICE '';
  RAISE NOTICE 'To view all admins:';
  RAISE NOTICE 'SELECT id, full_name, role, is_super_admin FROM profiles WHERE role = ''admin'';';
  RAISE NOTICE '';
END $$;
