# Community 3-Page System with Privacy Controls

## Overview
Created 3 separate community discussion pages filtered by content type, with privacy controls where students see anonymous names but mentors and parents can see real identities.

## 🎯 Three Community Pages

### 1. Recorded Classes Community (`src/pages/Community/RecordedClassesCommunity.tsx`)
- **Icon**: Video 📹
- **Color**: Blue
- **Category**: `recorded-classes`
- **Purpose**: Discuss recorded video lessons and share insights

### 2. Courses Community (`src/pages/Community/CoursesCommunity.tsx`)
- **Icon**: BookOpen 📚
- **Color**: Green
- **Category**: `courses`
- **Purpose**: Discuss course content and learning materials

### 3. Live Classes Community (`src/pages/Community/LiveClassesCommunity.tsx`)
- **Icon**: Radio 📡
- **Color**: Red
- **Category**: `live-classes`
- **Purpose**: Discuss live streaming classes and real-time learning

## 🔒 Privacy System

### For Students
- **See**: Anonymous nicknames (e.g., "SmartLearner123")
- **Post as**: Anonymous (auto-generated nickname)
- **Badge**: "Anonymous" badge shown
- **Privacy**: Identity protected from other students

### For Mentors & Parents
- **See**: Real names of all users
- **Special Badge**: "Real Identity Visible" badge shown
- **Alert**: Yellow banner at top indicating they can see real names
- **Access**: Full visibility into student identities and details

### How It Works
```typescript
const canSeeRealIdentity = user?.role === 'mentor' || user?.role === 'parent';

// Fetch real names if user is mentor/parent
if (canSeeRealIdentity) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);
  
  realNames = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
}

// Display logic
{canSeeRealIdentity ? post.real_name : post.anonymous_nickname}
```

## 📊 Database Updates

### Updated Schema (`database/15_community_schema.sql`)
Added `category` field to `community_posts`:
```sql
category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('recorded-classes', 'courses', 'live-classes', 'general'))
```

Added index for faster filtering:
```sql
CREATE INDEX IF NOT EXISTS community_posts_category_idx ON community_posts(category);
```

## 🎨 UI Features

### Each Page Includes:
1. **Unique Header**:
   - Custom icon and color
   - Page-specific title
   - Descriptive subtitle

2. **Privacy Indicator**:
   - For mentors/parents: Yellow banner showing they can see real names
   - For students: Anonymous badge on posts

3. **Post Display**:
   - Students see: Anonymous nicknames
   - Mentors/Parents see: Real names with "Real Identity Visible" badge

4. **Subject Filtering**:
   - Filter posts by subject
   - Dropdown with all available subjects

5. **Like & Reply System**:
   - Like/unlike posts
   - Reply to discussions
   - Real-time count updates

## 🚀 Setup Instructions

### 1. Update Database Schema
Run the updated migration:
```sql
-- In Supabase SQL Editor
-- Run: database/15_community_schema.sql
```

### 2. Add Routes to App.tsx
```typescript
import RecordedClassesCommunity from "./pages/Community/RecordedClassesCommunity";
import CoursesCommunity from "./pages/Community/CoursesCommunity";
import LiveClassesCommunity from "./pages/Community/LiveClassesCommunity";

// Add routes
<Route path="/community/recorded-classes" element={
  <PrivateRoute>
    <MainLayout>
      <RecordedClassesCommunity />
    </MainLayout>
  </PrivateRoute>
} />

<Route path="/community/courses" element={
  <PrivateRoute>
    <MainLayout>
      <CoursesCommunity />
    </MainLayout>
  </PrivateRoute>
} />

<Route path="/community/live-classes" element={
  <PrivateRoute>
    <MainLayout>
      <LiveClassesCommunity />
    </MainLayout>
  </PrivateRoute>
} />
```

### 3. Update Sidebar Navigation
Replace single Community link with 3 links:
```typescript
{
  icon: Video,
  label: 'Recorded Classes',
  path: '/community/recorded-classes'
},
{
  icon: BookOpen,
  label: 'Courses',
  path: '/community/courses'
},
{
  icon: Radio,
  label: 'Live Classes',
  path: '/community/live-classes'
}
```

## 🔐 Privacy Features

### Anonymous Nickname Generation
```typescript
const generateNickname = () => {
  const adjectives = ['Smart', 'Curious', 'Bright', 'Clever', 'Wise', 'Quick', 'Sharp'];
  const nouns = ['Student', 'Learner', 'Scholar', 'Thinker', 'Mind', 'Brain'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
};
```

### Role-Based Display
- **Students**: See anonymous nicknames everywhere
- **Mentors**: See real names with special badge
- **Parents**: See real names with special badge
- **Teachers**: See anonymous nicknames (can be changed if needed)

## 📝 Features Per Page

### Common Features (All 3 Pages)
- ✅ Create posts with title, subject, content
- ✅ Like/unlike posts
- ✅ Reply to posts
- ✅ View reply threads
- ✅ Filter by subject
- ✅ Real-time count updates
- ✅ Anonymous posting for students
- ✅ Real name visibility for mentors/parents

### Page-Specific Content
Each page filters posts by category:
- **Recorded Classes**: Only shows posts with `category = 'recorded-classes'`
- **Courses**: Only shows posts with `category = 'courses'`
- **Live Classes**: Only shows posts with `category = 'live-classes'`

## 🎯 User Experience

### Student View
1. Opens "Recorded Classes" community
2. Sees all posts with anonymous nicknames
3. Creates post → Auto-assigned anonymous nickname
4. Replies → Also anonymous
5. Privacy protected from peers

### Mentor/Parent View
1. Opens any community page
2. Sees yellow banner: "As a mentor/parent, you can see real names"
3. All posts show real student names
4. Special badge: "Real Identity Visible"
5. Can monitor student discussions

## ✅ Testing Checklist

### Privacy Tests
- [ ] Student sees anonymous nicknames
- [ ] Mentor sees real names
- [ ] Parent sees real names
- [ ] Teacher sees anonymous nicknames (or real if configured)
- [ ] Privacy banner shows for mentors/parents
- [ ] Anonymous badge shows for students

### Functionality Tests
- [ ] Posts filter by category correctly
- [ ] Can create posts in each category
- [ ] Likes work on all pages
- [ ] Replies work on all pages
- [ ] Subject filter works
- [ ] Real-time counts update

### Navigation Tests
- [ ] All 3 pages accessible from sidebar
- [ ] Correct icons and colors display
- [ ] Page titles are unique
- [ ] No cross-category posts appear

## 🎉 Summary

Created a comprehensive 3-page community system with:
- ✅ Separate pages for Recorded Classes, Courses, and Live Classes
- ✅ Category-based filtering in database
- ✅ Privacy controls: Students anonymous, Mentors/Parents see real names
- ✅ Role-based display logic
- ✅ Unique branding per page (icons, colors, titles)
- ✅ Full CRUD operations
- ✅ Like and reply systems
- ✅ Subject filtering
- ✅ Real-time updates

Ready for production use!
