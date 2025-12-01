-- ============================================
-- Add Super Admin Role
-- ============================================

-- This migration adds a super_admin role to the system
-- Super admins have elevated privileges over regular admins

-- Update the role enum to include super_admin
-- Note: In PostgreSQL, you can't directly modify an enum, so we need to:
-- 1. Add the new value to the enum
-- 2. Update existing data if needed

-- Add super_admin to the role enum
DO $$ 
BEGIN
  -- Check if super_admin already exists in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'super_admin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    -- Add super_admin to the enum
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- Add is_super_admin flag to profiles table for easier querying
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster super admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin) WHERE is_super_admin = TRUE;

-- Update existing admin users to mark the first one as super admin
-- (You can manually change this later)
DO $$
DECLARE
  first_admin_id UUID;
BEGIN
  -- Get the first admin user (by creation date)
  SELECT id INTO first_admin_id
  FROM profiles
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Mark them as super admin
  IF first_admin_id IS NOT NULL THEN
    UPDATE profiles
    SET is_super_admin = TRUE
    WHERE id = first_admin_id;
    
    RAISE NOTICE 'Marked user % as super admin', first_admin_id;
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

-- Create a function to prevent admins from deleting other admins
CREATE OR REPLACE FUNCTION check_admin_delete_permission()
RETURNS TRIGGER AS $$
DECLARE
  deleting_user_id UUID;
  is_deleting_super_admin BOOLEAN;
BEGIN
  -- Get the current user ID (the one performing the delete)
  deleting_user_id := auth.uid();
  
  -- Check if the deleting user is a super admin
  is_deleting_super_admin := is_super_admin(deleting_user_id);
  
  -- If trying to delete an admin
  IF OLD.role = 'admin' OR OLD.is_super_admin = TRUE THEN
    -- Only super admins can delete admins
    IF NOT is_deleting_super_admin THEN
      RAISE EXCEPTION 'Only super admins can delete admin users';
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce admin deletion rules
DROP TRIGGER IF EXISTS prevent_admin_deletion ON profiles;
CREATE TRIGGER prevent_admin_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_delete_permission();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_delete_permission() TO authenticated;

-- Display super admin info
DO $$
DECLARE
  super_admin_count INTEGER;
  super_admin_emails TEXT;
BEGIN
  SELECT COUNT(*), STRING_AGG(email, ', ')
  INTO super_admin_count, super_admin_emails
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.is_super_admin = TRUE;
  
  RAISE NOTICE 'Super Admin Setup Complete';
  RAISE NOTICE 'Total Super Admins: %', super_admin_count;
  RAISE NOTICE 'Super Admin Emails: %', super_admin_emails;
END $$;
