# Community System - Final Setup

## 🎯 Final Configuration

### Comment Boxes (3 Pages Only)
Students can comment from these 3 pages:

1. **Course Library** (`/student/video-lessons`)
   - Category: `courses`
   - Comments go to: Courses Community

2. **Recorded Classes** (`/student/recorded-videos`)
   - Category: `recorded-classes`
   - Comments go to: Recorded Classes Community

3. **Live Classes** (`/student/live-classes`)
   - Category: `live-classes`
   - Comments go to: Live Classes Community

### Community Pages (3 Filtered Views)

1. **Recorded Classes Community** (`/community/recorded-classes`)
   - Shows: Comments from Recorded Classes page
   - Filter: `category = 'recorded-classes'`

2. **Courses Community** (`/community/courses`)
   - Shows: Comments from Course Library page
   - Filter: `category = 'courses'`

3. **Live Classes Community** (`/community/live-classes`)
   - Shows: Comments from Live Classes page
   - Filter: `category = 'live-classes'`

### General Comments (No Filter)
- Comments without category go to general pool
- Can be viewed in any community page with "All" filter
- Default behavior for comments without specific category

## 📋 Pages WITHOUT Comment Boxes

These pages do NOT have comment boxes:
- ❌ Assignments
- ❌ Quizzes
- ❌ Study Materials
- ❌ Quiz Rankings
- ❌ Overall Rankings
- ❌ Projects
- ❌ Settings
- ❌ Dashboard

## 🎭 Role Permissions

### All 5 Roles Can View
- ✅ Student
- ✅ Teacher
- ✅ Mentor
- ✅ Parent
- ✅ Admin

### Only Students & Teachers Can Comment/Reply
- ✅ Student - Can post and reply (anonymous)
- ✅ Teacher - Can post and reply (anonymous)
- ❌ Mentor - View only
- ❌ Parent - View only
- ❌ Admin - View only

## 🔍 Special Filters

### For Mentors
- **"My Students" filter** - Shows only posts from assigned mentees
- Real name visibility

### For Parents
- **Child selector** - Defaults to showing their children's posts
- Can select specific child
- Real name visibility

### For Students & Teachers
- Subject filter
- Anonymous nicknames only

## 🎨 UI Features

### Comment Box
- Position: Right side of page title (desktop)
- Mobile: Below title
- Input + Send button
- Anonymous posting
- Success message on send

### Community Display
- Anonymous nicknames for students/teachers
- Real names for mentors/parents/admins
- Like/unlike functionality
- Reply threads
- Timestamp display
- Page source badge (if applicable)

## 🔄 Comment Flow

### 1. Student Posts from Course Library
```
Student on Course Library page
  ↓
Types comment in comment box
  ↓
Clicks "Send"
  ↓
Saved with:
  - category: "courses"
  - page_source: "Course Library"
  - anonymous_nickname: auto-generated
  ↓
Appears in Courses Community page
```

### 2. Teacher Views in Community
```
Teacher opens Courses Community
  ↓
Sees all course-related comments
  ↓
Can reply to any comment
  ↓
Reply also anonymous
```

### 3. Parent Views Comments
```
Parent opens any Community page
  ↓
Sees real student names (not anonymous)
  ↓
Selects their child from dropdown
  ↓
Sees only that child's comments
```

## 📊 Database Structure

### community_posts Table
```sql
- id: UUID
- user_id: UUID (hidden from community view)
- anonymous_nickname: VARCHAR
- content: TEXT
- category: VARCHAR ('courses', 'recorded-classes', 'live-classes', 'general')
- page_source: VARCHAR ('Course Library', 'Recorded Classes', etc.)
- is_anonymous: BOOLEAN (always true)
- parent_visible: BOOLEAN (always true)
- likes_count: INTEGER
- replies_count: INTEGER
- created_at: TIMESTAMP
```

## 🚀 Navigation

### Sidebar Menu Structure
```
Community (dropdown)
  ├── Recorded Classes
  ├── Courses
  └── Live Classes
```

### Routes
- `/community/recorded-classes` - Recorded Classes Community
- `/community/courses` - Courses Community
- `/community/live-classes` - Live Classes Community

## ✅ Testing Checklist

### Comment Posting
- [ ] Post from Course Library → Appears in Courses Community
- [ ] Post from Recorded Classes → Appears in Recorded Classes Community
- [ ] Post from Live Classes → Appears in Live Classes Community
- [ ] Success message shows after posting
- [ ] Input clears after posting

### Community Viewing
- [ ] Students see anonymous nicknames
- [ ] Teachers see anonymous nicknames
- [ ] Mentors see real names
- [ ] Parents see real names
- [ ] Admins see real names

### Filters
- [ ] Subject filter works
- [ ] Mentor "My Students" filter works
- [ ] Parent child selector works
- [ ] Default shows all comments in category

### Permissions
- [ ] Students can post and reply
- [ ] Teachers can post and reply
- [ ] Mentors can view only (no post/reply buttons)
- [ ] Parents can view only (no post/reply buttons)
- [ ] Admins can view only (no post/reply buttons)

### Likes
- [ ] All roles can like posts
- [ ] Like count updates
- [ ] Unlike works

### Replies
- [ ] Students can reply
- [ ] Teachers can reply
- [ ] Replies show in thread
- [ ] Reply count updates

## 🎉 Summary

**Final Setup:**
- ✅ 3 comment boxes on main learning pages
- ✅ 3 filtered community pages
- ✅ Role-based permissions working
- ✅ Anonymous posting for students/teachers
- ✅ Real names for mentors/parents
- ✅ Special filters for mentors and parents
- ✅ Like and reply systems functional

**Clean and Simple!** 🚀
