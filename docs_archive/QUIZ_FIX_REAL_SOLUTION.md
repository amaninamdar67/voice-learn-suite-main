# Quiz Submission Error - REAL FIX

## The Actual Problem

The frontend code in `src/pages/Student/QuizzesView.tsx` is trying to use `.upsert()` with:
```javascript
onConflict: 'student_id,quiz_id'
```

But the `quiz_results` table doesn't have a UNIQUE constraint on `(student_id, quiz_id)`. This causes the error:
```
Error: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## The Solution

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE quiz_results
ADD CONSTRAINT unique_student_quiz UNIQUE (student_id, quiz_id);
```

That's it! This creates a unique constraint that allows the upsert to work.

## Why This Works

- The frontend wants to allow students to retake quizzes (upsert = update if exists, insert if not)
- Upsert requires a unique constraint to know which row to update
- Adding the constraint tells the database: "Each student can only have one result per quiz"
- When a student retakes a quiz, it updates their previous result instead of creating a duplicate

## Steps

1. Go to Supabase Dashboard: https://app.supabase.co
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the SQL above
6. Click **Run**
7. Restart your backend
8. Test quiz submission - should work now!

## File to Run

**`database/67_add_quiz_results_unique_constraint.sql`**

Copy the SQL from this file and run it in Supabase.
