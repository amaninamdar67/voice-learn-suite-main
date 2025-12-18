# Quiz Submission Error - Complete Fix

## Problem
When students submit a quiz, they get this error:
```
Error: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Root Cause
The `quiz_results` table has RLS (Row Level Security) policies that prevent the backend service role from inserting records. The RLS policy requires `auth.uid() = student_id`, but the backend uses the service role which doesn't have a user ID.

## Solution

### Step 1: Disable RLS on quiz_results Table

1. Open your Supabase Dashboard: https://app.supabase.co
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see: `Query executed successfully`

### Step 2: Restart Backend Server

1. Stop your backend server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```
   or
   ```bash
   node backend/server.js
   ```

The server will now check the database on startup and log the status.

### Step 3: Test Quiz Submission

1. Go to the quiz page in your app
2. Answer some questions
3. Click **Submit Quiz**
4. You should see the score and success message

## Why This Works

- **Service Role**: The backend uses the Supabase service role key, which has admin privileges
- **RLS Policies**: These policies were designed for client-side access (students submitting their own results)
- **Backend Access**: The backend needs to bypass RLS to insert results on behalf of students
- **Safe**: This is safe because the backend validates all data before inserting

## Verification

After applying the fix, you should see this in the backend logs:
```
✓ Quiz results table verified
Database initialization complete
```

If you see a warning instead, manually run the SQL fix above.

## Additional Notes

- This fix only affects the `quiz_results` table
- Other tables keep their RLS policies for security
- Students can still only view their own results through the frontend (enforced by the app logic)
- Teachers can view all results for their quizzes (enforced by the app logic)

## Still Having Issues?

1. Check the browser console (F12) for error messages
2. Check the backend logs for database errors
3. Verify the SQL ran successfully in Supabase
4. Make sure you're using the correct Supabase project
5. Try clearing browser cache and reloading
