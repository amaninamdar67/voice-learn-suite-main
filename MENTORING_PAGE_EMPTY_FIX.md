# Mentoring Page Empty - Root Cause & Solution

## The Issue

The Mentoring page shows "No Students Assigned" because:

1. **No mentor-student links exist in the database** - The `mentor_student_links` table is empty
2. **Backend server may not be running** - API calls fail if server isn't started
3. **No test data** - The UI is working correctly, but there's nothing to display

## Why This Happens

The mentoring system works like this:
```
Mentor → (mentor_student_links) → Student
```

Without entries in `mentor_student_links`, mentors have no students to display.

## Solution

### Step 1: Start the Backend Server
```bash
cd backend
npm start
```

The server should output:
```
Backend server running on http://localhost:3001
```

### Step 2: Create Test Mentor-Student Links

Run the SQL script to create test data:

```sql
-- Execute: database/69_add_test_mentor_student_links.sql
```

Or manually create links via SQL:

```sql
-- Find a mentor and student
SELECT id, full_name, role FROM profiles WHERE role IN ('mentor', 'student') LIMIT 5;

-- Create a link (replace UUIDs with actual IDs)
INSERT INTO mentor_student_links (mentor_id, student_id)
VALUES ('mentor-uuid-here', 'student-uuid-here');
```

### Step 3: Verify in the UI

1. **Mentoring Page** - Should now show assigned students
2. **Dashboard** - Should show student count and stats
3. **Student Cards** - Click to view detailed analytics

## What the UI Shows When Data Exists

### Mentoring Page
- List of assigned students in cards
- Click a student to view:
  - Quiz performance
  - Attendance tracking
  - Assignment submissions
  - Overall stats

### Dashboard
- Total students count
- Active students count
- Total sessions
- Average rating

## Database Schema

```
mentor_student_links
├── id (BIGSERIAL PRIMARY KEY)
├── mentor_id (UUID → profiles.id)
├── student_id (UUID → profiles.id)
├── created_at (TIMESTAMP)
└── UNIQUE(mentor_id, student_id)
```

## Testing Checklist

- [ ] Backend server is running on port 3001
- [ ] Mentor-student links exist in database
- [ ] Mentoring page shows student list
- [ ] Dashboard shows student count > 0
- [ ] Clicking a student shows their data
- [ ] Quiz/Attendance/Assignment tabs work

## Common Issues

### "No Students Assigned" message
- Check if mentor-student links exist: `SELECT COUNT(*) FROM mentor_student_links;`
- Verify the current user is a mentor: `SELECT role FROM profiles WHERE id = current_user_id;`

### "Failed to load mentor data" error
- Backend server not running
- Check browser console for API errors
- Verify `/api/mentor/students/:mentorId` endpoint is accessible

### Empty tabs (Quiz/Attendance/Assignments)
- No data in related tables (quiz_results, lesson_attendance, assignment_submissions)
- This is normal for new test accounts
- Data will populate as students interact with the system

## Next Steps

1. Create mentor-student links using the SQL script
2. Optionally create sample quiz results, attendance, and assignment data
3. Test the UI with real data
4. Commit changes when working correctly
