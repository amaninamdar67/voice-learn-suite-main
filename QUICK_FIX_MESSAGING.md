# Quick Fix for Parent-Mentor Messaging

## The Issue
Messages from parent to mentor are failing to send after unlinking and re-linking.

## The Fix (3 Steps)

### 1. Run the Database Fix
Copy and paste this SQL into your Supabase SQL editor and run it:

```sql
-- Link all students without mentors to the first available mentor
WITH first_mentor AS (
  SELECT id FROM profiles WHERE role = 'mentor' ORDER BY created_at LIMIT 1
),
students_without_mentors AS (
  SELECT DISTINCT psl.student_id
  FROM parent_student_links psl
  LEFT JOIN mentor_student_links msl ON psl.student_id = msl.student_id
  WHERE msl.id IS NULL
)
INSERT INTO mentor_student_links (mentor_id, student_id)
SELECT fm.id, swm.student_id
FROM first_mentor fm
CROSS JOIN students_without_mentors swm
ON CONFLICT (mentor_id, student_id) DO NOTHING;
```

### 2. Restart the Backend
The backend has been updated with automatic mentor linking. Restart it to apply the changes.

### 3. Test
Try sending a message again. It should work now!

## What Was Fixed
1. ✅ Added `senderId` to message requests
2. ✅ Improved error messages
3. ✅ Added automatic mentor linking when linking parents to students
4. ✅ Added comprehensive logging for debugging

## If It Still Doesn't Work
1. Check the browser console (F12) for the actual error message
2. Verify the mentor is linked to the student by running:
   ```sql
   SELECT * FROM mentor_student_links WHERE student_id = '[STUDENT_ID]';
   ```
3. If no results, manually link the mentor:
   ```sql
   INSERT INTO mentor_student_links (mentor_id, student_id)
   VALUES ('[MENTOR_ID]', '[STUDENT_ID]');
   ```
