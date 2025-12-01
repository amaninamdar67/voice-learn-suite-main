# Quick Reference - Edit/Delete Features

## 🚀 Quick Start

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor:
-- Copy and run: database/17_add_edit_delete_community.sql
```

### 2. Test the Features
1. Go to any community page (e.g., `/community/recorded-classes`)
2. Create a post
3. Look for **Edit button in bottom right corner**
4. Click Edit → Modify content → Save
5. See **"edited" badge** appear next to date
6. Click Edit again → Click **Delete button** → Confirm

## 📍 Where to Find Things

### Edit Button Location
- **Posts**: Bottom right corner of post card
- **Replies**: Small button below reply text
- **Visibility**: Only on YOUR content

### Edited Watermark
- **Location**: Next to timestamp in header
- **Appearance**: Gray badge with "edited" text
- **When**: Appears after first edit

### Delete Button
- **Location**: Inside edit mode, right side
- **Color**: Red
- **Action**: Shows confirmation dialog

## 🎯 All 5 Community Pages

| Page | Route | Icon | Color |
|------|-------|------|-------|
| Courses | `/community/courses` | 📚 BookOpen | Green |
| Recorded Classes | `/community/recorded-classes` | 📹 Video | Blue |
| Live Classes | `/community/live-classes` | 📡 Radio | Red |
| Quizzes | `/community/quizzes` | 🧠 Brain | Purple |
| Assignments | `/community/assignments` | 📄 FileText | Orange |

## 🔐 Permissions Quick Check

| Role | Create | View | Edit Own | Delete Own | See Real Names |
|------|--------|------|----------|------------|----------------|
| Student | ✅ | ✅ | ✅ | ✅ | ❌ |
| Teacher | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mentor | ❌ | ✅ | ❌ | ❌ | ✅ |
| Parent | ❌ | ✅ | ❌ | ❌ | ✅ |

## 🎨 Visual Quick Guide

```
┌─────────────────────────────────┐
│ Username • Date • edited ← 1    │  1. Edited badge
│ Content...                      │
│                      [Edit] ← 2 │  2. Edit button (bottom right)
└─────────────────────────────────┘

Edit Mode:
┌─────────────────────────────────┐
│ [Input fields]                  │
│ [Save] [Cancel]    [Delete] ← 3 │  3. Delete button (right side)
└─────────────────────────────────┘
```

## 🔧 API Endpoints

```
PUT    /api/community/posts/:id      - Update post
DELETE /api/community/posts/:id      - Delete post
PUT    /api/community/replies/:id    - Update reply
DELETE /api/community/replies/:id    - Delete reply
```

## 📋 Testing Checklist

- [ ] Database migration run
- [ ] Backend server running (port 3001)
- [ ] Frontend running (port 8080)
- [ ] Can create post
- [ ] Edit button visible (own post)
- [ ] Can edit post
- [ ] "Edited" badge appears
- [ ] Can delete post
- [ ] Can edit reply
- [ ] Can delete reply
- [ ] Cannot edit others' posts

## 🐛 Troubleshooting

### Edit button not showing?
- Check if you're the post owner
- Verify `user?.id === post.user_id`

### "Edited" badge not appearing?
- Run database migration
- Check `is_edited` field in database

### Delete not working?
- Check backend server is running
- Verify API endpoint is registered
- Check browser console for errors

### Cannot edit others' posts?
- This is correct behavior!
- Only owners can edit their content

## 📁 Files Modified

### Must Run:
- `database/17_add_edit_delete_community.sql`

### Backend:
- `backend/lms-routes.js`
- `backend/server.js`

### Frontend:
- `src/pages/Community/RecordedClassesCommunity.tsx`
- `src/pages/Community/CoursesCommunity.tsx`
- `src/pages/Community/LiveClassesCommunity.tsx`
- `src/pages/Community/QuizzesCommunity.tsx`
- `src/pages/Community/AssignmentsCommunity.tsx`
- `src/App.tsx`

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Edit button appears bottom right on your posts
2. ✅ Clicking edit shows input fields
3. ✅ Saving shows "edited" badge
4. ✅ Delete button appears in edit mode
5. ✅ Deleting removes the post
6. ✅ Works on all 5 community pages

## 🎉 Done!

All features implemented and ready to use!
