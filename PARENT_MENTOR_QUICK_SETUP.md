# 🚀 Parent-Mentor Linking - Quick Setup Guide

## ✅ Fixed for Your Database Structure

Your system uses a single `profiles` table for all users (students, parents, mentors, etc.), not separate tables. I've created a corrected version that works with your structure.

---

## 📋 Step 1: Run Database Migration

In Supabase SQL Editor, run this file:
```
database/21_parent_mentor_linking_FIXED.sql
```

This creates:
- `parent_children` table
- `mentor_students` table
- `mentoring_notes` table
- `parent_notifications` table

---

## 🔗 Step 2: Link Parent to Student

### Method A: Using SQL (Easiest)

```sql
-- Example: Link parent@example.com to student@example.com

INSERT INTO parent_children (parent_id, student_id, relationship_type)
VALUES (
  (SELECT id FROM profiles WHERE email = 'parent@example.com' AND role = 'parent'),
  (SELECT id FROM profiles WHERE email = 'student@example.com' AND role = 'student'),
  'parent'
);
```

### Method B: Link Multiple Children

```sql
-- Link one parent to multiple students

INSERT INTO parent_children (parent_id, student_id, relationship_type)
SELECT 
  (SELECT id FROM profiles WHERE email = 'parent@example.com' AND role = 'parent'),
  p.id,
  'parent'
FROM profiles p
WHERE p.email IN ('student1@example.com', 'student2@example.com')
  AND p.role = 'student';
```

---

## 🎓 Step 3: Link Mentor to Students

```sql
-- Example: Link mentor@example.com to student@example.com

INSERT INTO mentor_students (mentor_id, student_id, mentoring_focus, meeting_frequency)
VALUES (
  (SELECT id FROM profiles WHERE email = 'mentor@example.com' AND role = 'mentor'),
  (SELECT id FROM profiles WHERE email = 'student@example.com' AND role = 'student'),
  'Academic Support',
  'weekly'
);
```

---

## 🖥️ Step 4: Update Frontend

### Option A: Replace Existing Component

In `src/App.tsx`, update the import:

```tsx
// Change this:
import ChildrenView from './pages/Parent/ChildrenView';

// To this:
import ChildrenView from './pages/Parent/ChildrenViewRealTime';
```

### Option B: Add New Route (for testing)

```tsx
<Route path="/parent/children-realtime" element={<ChildrenViewRealTime />} />
```

---

## 🧪 Step 5: Test It

1. **Start Backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Login as Parent:**
   - Use the parent email you linked
   - Navigate to "My Children"
   - You should see your linked children!

4. **Login as Mentor:**
   - Use the mentor email you linked
   - Navigate to "Student Mentoring"
   - You should see your assigned students!

---

## 📊 What Data You'll See

### For Parents:
- ✅ Quiz results with scores
- ✅ Video lesson progress
- ✅ Assignment submissions
- ✅ Live class attendance
- ✅ Performance statistics

### For Mentors:
- ✅ All parent data PLUS
- ✅ Mentoring notes
- ✅ Session tracking
- ✅ Progress over time

---

## 🔍 Verify Links

Check if links were created:

```sql
-- View all parent-child links
SELECT 
  p1.email as parent_email,
  p2.email as student_email,
  pc.relationship_type,
  pc.linked_at
FROM parent_children pc
JOIN profiles p1 ON pc.parent_id = p1.id
JOIN profiles p2 ON pc.student_id = p2.id;

-- View all mentor-student links
SELECT 
  p1.email as mentor_email,
  p2.email as student_email,
  ms.mentoring_focus,
  ms.assigned_at
FROM mentor_students ms
JOIN profiles p1 ON ms.mentor_id = p1.id
JOIN profiles p2 ON ms.student_id = p2.id
WHERE ms.is_active = true;
```

---

## ❌ Troubleshooting

### Error: "relation students does not exist"
✅ **Fixed!** Use `21_parent_mentor_linking_FIXED.sql` instead

### No children showing up
- Check if parent-child link exists (SQL above)
- Verify parent email matches logged-in user
- Check browser console for errors

### No data showing
- Ensure student has taken quizzes/watched videos
- Check backend is running on port 3001
- Verify API endpoints are working

---

## 📝 Quick Reference

### Files Created:
- ✅ `database/21_parent_mentor_linking_FIXED.sql` - Database schema
- ✅ `backend/parent-mentor-routes.js` - API endpoints (updated)
- ✅ `src/pages/Parent/ChildrenViewRealTime.tsx` - Parent UI (updated)

### Files Updated:
- ✅ `backend/server.js` - Added routes

### API Endpoints:
- `GET /api/parent/:parentUserId/children`
- `GET /api/parent/child/:studentId`
- `GET /api/mentor/:mentorUserId/students`
- `GET /api/mentor/student/:studentId`

---

## 🎉 You're Done!

Once you:
1. ✅ Run the SQL migration
2. ✅ Link parents/mentors to students
3. ✅ Update the frontend component
4. ✅ Restart backend

Parents and mentors will see real-time student data! 🚀

---

**Need Help?**
- Check `PARENT_MENTOR_LINKING_COMPLETE.md` for full documentation
- All code is ready to use
- Just run the SQL and link users!
