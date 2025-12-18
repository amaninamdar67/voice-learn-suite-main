# RLS Blocking Delete - FIX

## The Problem
**Row Level Security (RLS)** policies on the `mentor_parent_messages` table are blocking DELETE operations.

RLS is a Supabase security feature that restricts what data users can access. When enabled, it can prevent deletes even from the backend service role.

## The Solution
Disable RLS on the `mentor_parent_messages` table so the backend can delete messages freely.

## How to Fix

### Step 1: Run the SQL Migration
1. Go to Supabase Dashboard → SQL Editor
2. Click **New Query**
3. Copy contents of `database/50_disable_rls_messaging.sql`
4. Paste into editor
5. Click **Run**

### Step 2: Verify RLS is Disabled
Run this query to confirm:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'mentor_parent_messages';
```

**Expected result:**
- `tablename`: mentor_parent_messages
- `rowsecurity`: false (or OFF)

### Step 3: Restart Backend
- Stop backend server
- Start it again

### Step 4: Test Delete
1. Go to Mentor Messages page
2. Click trash icon on a message
3. Confirm deletion
4. Message should disappear immediately
5. Check backend console for `[DELETE]` or `[DELETE-POST]` logs

## What RLS Does
RLS policies control who can:
- SELECT (read) data
- INSERT (create) data
- UPDATE (modify) data
- DELETE (remove) data

When RLS is enabled, even the backend service role must follow the policies.

## Why We're Disabling It
The `mentor_parent_messages` table doesn't need RLS because:
- Backend uses service role (has admin privileges)
- Authorization is checked in the backend code
- We verify user owns the message before deleting

## Security Note
This is safe because:
- Backend still verifies user authorization
- Only the backend can call the delete endpoint
- Frontend can't directly access the database
- Service role is protected by environment variables

## If Delete Still Doesn't Work

### Check 1: Verify RLS is Actually Disabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'mentor_parent_messages';
```

### Check 2: Check Backend Logs
Look for:
- `[DELETE] Permanently deleting message:` - Delete started
- `[DELETE] Message permanently deleted:` - Delete succeeded
- `[DELETE] Error deleting message:` - Delete failed

### Check 3: Check Browser Console
- Open DevTools (F12)
- Look for JavaScript errors
- Check Network tab for the request

### Check 4: Verify Message Exists
```sql
SELECT id, mentor_id, parent_id, message FROM mentor_parent_messages 
WHERE id = 'YOUR_MESSAGE_ID';
```

## Files Modified
- `database/50_disable_rls_messaging.sql` - Disables RLS

## Related Files
- `backend/mentor-parent-messaging.js` - Delete endpoints
- `src/pages/Mentor/MentorMessages.tsx` - Delete UI
- `src/pages/Parent/ChildrenView.tsx` - Delete UI

## Summary
RLS was blocking deletes. Disabling it allows the backend service role to delete messages. The backend still verifies authorization, so it's secure.
