-- Disable RLS on mentor_parent_messages table to allow deletes
-- This allows the backend service role to delete messages without RLS restrictions

-- Disable RLS on the table
ALTER TABLE mentor_parent_messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'mentor_parent_messages';
-- Should show: rowsecurity = false
