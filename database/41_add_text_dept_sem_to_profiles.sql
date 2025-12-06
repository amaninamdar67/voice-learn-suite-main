-- Add department and semester as text fields to profiles table
-- This allows users to have department/semester info without foreign key references

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS semester text;

SELECT 'Added department and semester text columns to profiles table' as status;
