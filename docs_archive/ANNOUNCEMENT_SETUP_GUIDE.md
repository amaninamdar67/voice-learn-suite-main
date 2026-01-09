# Announcement System Setup Guide

## Status: Ready for Testing

### What's Been Fixed

1. **Frontend (src/pages/Announcement.tsx)**
   - ✅ Removed unused `IconButton` import
   - ✅ Deduplication logic implemented (uses Map with `sender_id-created_at` key)
   - ✅ Tag/Priority feature with dropdown selector
   - ✅ Color-coded chips for tags (urgent=red, important=orange, info=green, normal=blue)
   - ✅ Improved UI with gradient header, better card styling, hover effects
   - ✅ Date/time formatting (Today, Yesterday, or date)
   - ✅ Only teachers/mentors can send, students can only view

2. **Backend (backend/announcements-routes.js)**
   - ✅ Updated `/api/announcements/broadcast` to accept `announcement_tag` parameter
   - ✅ Updated `/api/announcements/all` to return `announcement_tag` in response
   - ✅ Broadcasts to all students (creates individual messages for each)
   - ✅ Handles missing tag gracefully (defaults to 'normal')

3. **Routes (src/App.tsx, src/components/Layout/Sidebar.tsx)**
   - ✅ Routes configured: `/teacher/announcements`, `/student/announcements`, `/mentor/announcements`
   - ✅ Sidebar renamed "Messages" → "Announcements" for teacher/student
   - ✅ Mentor module has separate "Announcements" sidebar item (Messages unchanged)

### What Still Needs to Be Done

**CRITICAL: Apply Database Migration**

Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard):

```sql
-- Add tag column to user_messages for announcement categorization
ALTER TABLE user_messages ADD COLUMN IF NOT EXISTS announcement_tag VARCHAR(50) DEFAULT 'normal';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_messages_announcement_tag ON user_messages(announcement_tag) WHERE message_type = 'announcement';

-- Add comment
COMMENT ON COLUMN user_messages.announcement_tag IS 'Tag for announcements: normal, urgent, important, etc.';
```

### Testing Checklist

After applying the database migration:

1. **Restart Backend Server**
   - Stop the backend (Ctrl+C)
   - Run: `npm start` in the backend folder

2. **Test Teacher Module**
   - Go to `/teacher/announcements`
   - Select a priority tag from dropdown
   - Send an announcement
   - Verify it appears once in the feed (not duplicated)
   - Verify tag color is correct

3. **Test Student Module**
   - Go to `/student/announcements`
   - Verify you can see the announcement sent by teacher
   - Verify NO input field (students can only view)
   - Verify tag color matches

4. **Test Mentor Module**
   - Go to `/mentor/announcements`
   - Verify you can send announcements (input field visible)
   - Send an announcement with different tag
   - Verify it appears once in the feed

5. **Verify Deduplication**
   - Send an announcement from teacher
   - Check both student and mentor announcement pages
   - Should see it ONCE, not 4 times (one per student)

### How It Works

**Deduplication Logic:**
- Frontend uses `Map` with key: `${sender_id}-${created_at}`
- This ensures each unique announcement (by sender and time) appears only once
- Works because all students receive the same message at the same time

**Tag System:**
- Tags: normal (blue), urgent (red), important (orange), info (green)
- Stored in `announcement_tag` column
- Displayed as colored chips with icons
- Defaults to 'normal' if not specified

**Broadcasting:**
- When teacher/mentor sends announcement, backend creates individual messages for each student
- All students get the same message with same `sender_id` and `created_at`
- Frontend deduplicates to show once per announcement

### Files Modified

- `src/pages/Announcement.tsx` - Frontend component
- `backend/announcements-routes.js` - Backend endpoints
- `database/76_add_announcement_tag.sql` - Database migration (needs manual execution)
- `src/App.tsx` - Routes
- `src/components/Layout/Sidebar.tsx` - Sidebar menu
- `backend/server.js` - Route initialization

### Troubleshooting

**Announcements showing multiple times:**
- Ensure database migration is applied
- Check browser console for errors
- Verify deduplication logic is working (check Network tab in DevTools)

**Tag not showing:**
- Ensure database migration is applied
- Restart backend server
- Clear browser cache

**Can't send announcement:**
- Verify you're logged in as teacher/mentor
- Check backend console for errors
- Ensure `/api/announcements/broadcast` endpoint is working
