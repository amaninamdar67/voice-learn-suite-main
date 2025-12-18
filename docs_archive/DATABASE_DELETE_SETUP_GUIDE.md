# Database Setup for Message Delete Functionality

## Overview
The delete functionality requires two SQL migrations to be run in your Supabase database:
1. `database/48_add_message_soft_delete.sql` - Initial setup
2. `database/49_verify_and_fix_delete_system.sql` - Verification and fixes

## Step 1: Run the Initial Migration

### Option A: Using Supabase Dashboard (Recommended)
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `database/48_add_message_soft_delete.sql`
6. Paste into the query editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for success message

### Option B: Using Supabase CLI
```bash
supabase db push
```

## Step 2: Run the Verification Migration

1. Go to **SQL Editor** again
2. Click **New Query**
3. Copy the contents of `database/49_verify_and_fix_delete_system.sql`
4. Paste into the query editor
5. Click **Run**
6. Wait for success message

## Step 3: Verify the Setup

Run this query in SQL Editor to check if columns exist:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'mentor_parent_messages' 
AND column_name IN ('is_deleted', 'deleted_at');
```

**Expected Result:**
- `is_deleted` - BOOLEAN, NOT NULL, DEFAULT: false
- `deleted_at` - TIMESTAMP, NULLABLE, DEFAULT: NULL

## Step 4: Test the Delete Functionality

1. Restart your backend server
2. Go to Mentor Messages page
3. Click trash icon on a message
4. Confirm deletion
5. Message should disappear

## Troubleshooting

### Error: "Column already exists"
- This is normal if you've run the migration before
- The `IF NOT EXISTS` clause prevents errors
- Just run the migration again, it will skip existing columns

### Error: "Permission denied"
- You need admin/owner access to the Supabase project
- Contact your project owner
- Or use a service role key with proper permissions

### Messages still showing after delete
1. Check browser cache - clear it
2. Restart backend server
3. Verify the SQL migrations ran successfully
4. Check backend console for errors

### Delete button not working
1. Check browser console for errors (F12)
2. Check backend console for `[DELETE-POST]` logs
3. Verify the POST endpoint is being called
4. Run the verification SQL to ensure columns exist

## What These Migrations Do

### Migration 48 (Initial Setup)
- Adds `is_deleted` column (BOOLEAN, default FALSE)
- Adds `deleted_at` column (TIMESTAMP, nullable)
- Creates index on `is_deleted` for faster queries

### Migration 49 (Verification & Fixes)
- Ensures both columns exist
- Creates additional indexes for performance
- Creates composite index for common queries
- Updates any NULL values to FALSE
- Provides verification queries

## How Soft Delete Works

1. **User clicks delete** → Frontend sends POST request
2. **Backend receives request** → Verifies user owns the message
3. **Message marked as deleted** → Sets `is_deleted = TRUE`, `deleted_at = NOW()`
4. **Message content cleared** → Sets message = '[Message deleted]'
5. **Frontend refreshes** → Queries exclude deleted messages
6. **Message disappears** → User sees updated list

## Verification Queries

### Check if columns exist:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'mentor_parent_messages' 
AND column_name IN ('is_deleted', 'deleted_at');
```

### View all non-deleted messages:
```sql
SELECT id, mentor_id, parent_id, student_id, message, created_at 
FROM mentor_parent_messages 
WHERE is_deleted = FALSE 
ORDER BY created_at DESC;
```

### View all deleted messages:
```sql
SELECT id, mentor_id, parent_id, student_id, deleted_at 
FROM mentor_parent_messages 
WHERE is_deleted = TRUE 
ORDER BY deleted_at DESC;
```

### Count deleted vs active messages:
```sql
SELECT 
  is_deleted,
  COUNT(*) as count
FROM mentor_parent_messages 
GROUP BY is_deleted;
```

## Files Involved

**Database:**
- `database/48_add_message_soft_delete.sql` - Initial migration
- `database/49_verify_and_fix_delete_system.sql` - Verification migration

**Backend:**
- `backend/mentor-parent-messaging.js` - Delete endpoints (POST and DELETE)
- `backend/server.js` - Router registration

**Frontend:**
- `src/pages/Mentor/MentorMessages.tsx` - Delete UI and handlers
- `src/pages/Parent/ChildrenView.tsx` - Parent delete functionality (if applicable)

## Next Steps

1. Run both SQL migrations
2. Restart backend server
3. Test delete functionality
4. If still not working, check the troubleshooting section
5. Review backend console logs for `[DELETE-POST]` messages
