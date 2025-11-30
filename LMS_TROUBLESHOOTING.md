# 🔧 LMS Troubleshooting Guide

## Issue 1: "Row violates row-level security policy" Error

**Symptom:** When creating recorded videos, video lessons, live classes, or quizzes, you get an RLS policy error.

**Solution:**
Run this SQL in Supabase SQL Editor:
```sql
-- File: database/FIX_RLS_POLICIES.sql
```

This fixes the RLS policies to allow teachers to create content and students to view all content.

---

## Issue 2: Student Pages Show "No Content Available"

**Symptom:** Student pages show empty even though teachers have created content.

**Cause:** Pages were filtering by student's grade, but if grade doesn't match or isn't set, nothing shows.

**Solution:** ✅ FIXED - Student pages now show ALL content regardless of grade.

---

## Issue 3: Routes Give 404 Error

**Symptom:** Clicking "Live Classes" or other LMS links gives 404.

**Solution:** ✅ FIXED - All routes added to App.tsx and Sidebar.tsx updated.

---

## Quick Fixes Applied

### 1. Fixed RLS Policies
- Teachers can now create content without RLS errors
- Students can view all content (not filtered by grade)
- Proper permissions granted

### 2. Removed Grade Filtering
Updated these files:
- `src/pages/Student/QuizzesView.tsx`
- `src/pages/Student/LiveClassesView.tsx`
- `src/pages/Student/VideoLessonsView.tsx`

Now students see ALL content, not just their grade.

### 3. Added All Routes
- Added 10 LMS routes to `src/App.tsx`
- Updated `src/components/Layout/Sidebar.tsx` with proper navigation

---

## How to Apply Fixes

### Step 1: Fix Database (RLS Policies)
```bash
# In Supabase SQL Editor, run:
database/FIX_RLS_POLICIES.sql
```

### Step 2: Restart Frontend
```bash
# The code changes are already applied
# Just refresh your browser
```

---

## Testing Checklist

### As Teacher:
- [ ] Create Video Lesson → Should work without errors
- [ ] Create Recorded Video → Should work without errors
- [ ] Create Live Class → Should work without errors
- [ ] Create Quiz → Should work without errors

### As Student:
- [ ] View Video Lessons → Should see all lessons
- [ ] View Recorded Videos → Should see all videos
- [ ] View Live Classes → Should see all classes
- [ ] View Quizzes → Should see all quizzes
- [ ] Take Quiz → Should work and show results
- [ ] View Rankings → Should show leaderboard

---

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
**Solution:** Make sure you're logged in and have a valid user profile.

### Issue: "Failed to fetch"
**Solution:** Ensure backend is running on port 3001:
```bash
cd backend
node server.js
```

### Issue: Empty dropdown/select fields
**Solution:** This is normal if no data exists yet. Create content as teacher first.

### Issue: Video player not loading
**Solution:** 
1. Check YouTube URL is valid
2. Ensure video is not private/restricted
3. Check browser console for errors

---

## Database Check

Run this in Supabase SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'video_lessons',
  'recorded_videos',
  'live_classes',
  'quizzes',
  'quiz_questions',
  'lesson_attendance',
  'video_watch_history',
  'live_attendance',
  'live_attendance_pings',
  'live_ping_responses',
  'quiz_results',
  'quiz_rankings'
)
ORDER BY table_name;
```

Should return 12 tables.

---

## Still Having Issues?

1. **Check browser console** for JavaScript errors
2. **Check Supabase logs** for database errors
3. **Verify user role** in profiles table
4. **Clear browser cache** and refresh
5. **Check backend logs** for API errors

---

## Quick Reset (Nuclear Option)

If everything is broken:

```sql
-- 1. Drop all LMS tables
DROP TABLE IF EXISTS quiz_rankings CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS live_ping_responses CASCADE;
DROP TABLE IF EXISTS live_attendance_pings CASCADE;
DROP TABLE IF EXISTS live_attendance CASCADE;
DROP TABLE IF EXISTS video_watch_history CASCADE;
DROP TABLE IF EXISTS lesson_attendance CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS live_classes CASCADE;
DROP TABLE IF EXISTS recorded_videos CASCADE;
DROP TABLE IF EXISTS video_lessons CASCADE;

-- 2. Re-run the schema
-- Run: database/LMS_ALL_SCHEMAS.sql

-- 3. Apply fixes
-- Run: database/FIX_RLS_POLICIES.sql
```

---

## Success Indicators

✅ Teacher can create content without errors
✅ Student can see all content
✅ No 404 errors on navigation
✅ Video player loads correctly
✅ Quiz submission works
✅ Rankings show up after quiz completion

---

## Performance Tips

1. **Limit video duration** - Shorter videos load faster
2. **Use YouTube's fastest servers** - youtube-nocookie.com
3. **Optimize images** - Use compressed thumbnails
4. **Index frequently queried fields** - Already done in schema
5. **Use pagination** - For large content lists (future enhancement)
