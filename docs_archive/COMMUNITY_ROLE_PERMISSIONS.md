# Community Role-Based Permissions & Filters

## Overview
Updated community system with role-based permissions where all 5 roles can view, but only students and teachers can comment and reply.

## 🎭 Role Permissions

### 1. Student
- ✅ **Can View**: All posts and replies
- ✅ **Can Post**: Yes (anonymous)
- ✅ **Can Reply**: Yes (anonymous)
- ✅ **Can Like**: Yes
- 👁️ **Sees**: Anonymous nicknames for all users
- 🔍 **Filters**: Subject

### 2. Teacher
- ✅ **Can View**: All posts and replies
- ✅ **Can Post**: Yes (anonymous)
- ✅ **Can Reply**: Yes (anonymous)
- ✅ **Can Like**: Yes
- 👁️ **Sees**: Anonymous nicknames for all users
- 🔍 **Filters**: Subject

### 3. Mentor
- ✅ **Can View**: All posts and replies
- ❌ **Can Post**: No (view only)
- ❌ **Can Reply**: No (view only)
- ✅ **Can Like**: Yes
- 👁️ **Sees**: Real names of all students
- 🔍 **Filters**: 
  - Subject
  - **"My Students"** - Shows only posts from assigned mentees

### 4. Parent
- ✅ **Can View**: All posts and replies
- ❌ **Can Post**: No (view only)
- ❌ **Can Reply**: No (view only)
- ✅ **Can Like**: Yes
- 👁️ **Sees**: Real names of all students
- 🔍 **Filters**:
  - Subject
  - **Child selector** - Defaults to showing their children's posts
  - Can select specific child from dropdown

### 5. Admin
- ✅ **Can View**: All posts and replies
- ❌ **Can Post**: No (view only)
- ❌ **Can Reply**: No (view only)
- ✅ **Can Like**: Yes
- 👁️ **Sees**: Real names of all students
- 🔍 **Filters**: Subject

## 🔍 Special Filters

### Mentor Filter: "My Students"
```typescript
// Fetch mentor's assigned students
const { data } = await supabase
  .from('profiles')
  .select('id')
  .eq('mentor_id', user?.id);

// Filter posts
if (filterStudent === 'my-students') {
  posts = posts.filter(post => myStudentIds.includes(post.user_id));
}
```

**UI**:
```tsx
<select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)}>
  <option value="all">All Students</option>
  <option value="my-students">My Students Only</option>
</select>
```

### Parent Filter: Child Selector
```typescript
// Fetch parent's children
const { data } = await supabase
  .from('profiles')
  .select('id, full_name')
  .eq('parent_id', user?.id);

// Default to first child
setFilterChild(data[0].id);

// Filter posts
if (filterChild !== 'all') {
  posts = posts.filter(post => post.user_id === filterChild);
}
```

**UI**:
```tsx
<select value={filterChild} onChange={(e) => setFilterChild(e.target.value)}>
  <option value="all">All Children</option>
  {children.map(child => (
    <option key={child.id} value={child.id}>{child.name}</option>
  ))}
</select>
```

## 🎨 UI Updates

### View-Only Banner (Mentors, Parents, Admins)
```tsx
{!canComment && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2 text-blue-800">
      <Eye size={20} />
      <span className="font-medium">
        You can view all discussions. Only students and teachers can post and reply.
      </span>
    </div>
  </div>
)}
```

### Conditional New Post Button
```tsx
{canComment && (
  <button onClick={() => setShowCreateModal(true)}>
    <MessageCircle size={20} />
    New Post
  </button>
)}
```

### Conditional Reply Input
```tsx
{canComment ? (
  <div className="flex gap-3">
    <input placeholder="Write a reply..." />
    <button>Send</button>
  </div>
) : (
  <div className="text-center py-4 text-gray-500 text-sm">
    Only students and teachers can reply to discussions
  </div>
)}
```

## 📊 Database Schema

### Profiles Table (Assumed Structure)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  role VARCHAR(50),
  parent_id UUID REFERENCES profiles(id),  -- For parent-child relationship
  mentor_id UUID REFERENCES profiles(id),  -- For mentor-student relationship
  ...
);
```

## 🔄 Data Flow

### 1. Student Posts Comment
```
Student writes comment
  ↓
Saved with anonymous nickname
  ↓
Visible to all 5 roles
  ↓
Students/Teachers see: Anonymous
Mentors/Parents/Admins see: Real name
```

### 2. Mentor Views Comments
```
Mentor opens community
  ↓
Sees all posts with real names
  ↓
Selects "My Students" filter
  ↓
Only sees posts from assigned mentees
```

### 3. Parent Views Comments
```
Parent opens community
  ↓
Automatically filtered to show their children
  ↓
Can select specific child from dropdown
  ↓
Sees real names of all students
```

## 🎯 Implementation Checklist

### Recorded Classes Community
- [x] Add `canComment` permission check
- [x] Hide "New Post" button for non-commenters
- [x] Add view-only banner
- [x] Conditional reply input
- [x] Mentor "My Students" filter
- [x] Parent child selector
- [x] Fetch children/students on mount

### Courses Community
- [ ] Same updates as Recorded Classes

### Live Classes Community
- [ ] Same updates as Recorded Classes

### Apply to All 3 Community Pages
- Recorded Classes
- Courses
- Live Classes

## 💻 Code Implementation

### Permission Check
```typescript
const canComment = user?.role === 'student' || user?.role === 'teacher';
const canSeeRealIdentity = user?.role === 'mentor' || user?.role === 'parent' || user?.role === 'admin';
```

### Fetch Mentor's Students
```typescript
const fetchMyStudents = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('mentor_id', user?.id);
  
  setMyStudentIds(data?.map(s => s.id) || []);
};
```

### Fetch Parent's Children
```typescript
const fetchChildren = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('parent_id', user?.id);
  
  setChildren(data?.map(c => ({ id: c.id, name: c.full_name })) || []);
  
  // Default to first child
  if (data && data.length > 0) {
    setFilterChild(data[0].id);
  }
};
```

### Filter Logic
```typescript
const filteredPosts = posts.filter(post => {
  // Subject filter
  if (filterSubject !== 'all' && post.subject !== filterSubject) return false;
  
  // Mentor filter
  if (user?.role === 'mentor' && filterStudent === 'my-students') {
    if (!myStudentIds.includes(post.user_id)) return false;
  }
  
  // Parent filter
  if (user?.role === 'parent' && filterChild !== 'all') {
    if (post.user_id !== filterChild) return false;
  }
  
  return true;
});
```

## 🔐 Security Considerations

### RLS Policies
- All roles can SELECT from community_posts
- Only students and teachers can INSERT
- Only students and teachers can INSERT replies
- Users can only UPDATE/DELETE their own posts

### Privacy
- Students see anonymous nicknames
- Teachers see anonymous nicknames
- Mentors see real names (for monitoring)
- Parents see real names (for monitoring)
- Admins see real names (for moderation)

## ✅ Testing Checklist

### Student
- [ ] Can create posts
- [ ] Can reply to posts
- [ ] Sees anonymous nicknames
- [ ] Subject filter works

### Teacher
- [ ] Can create posts
- [ ] Can reply to posts
- [ ] Sees anonymous nicknames
- [ ] Subject filter works

### Mentor
- [ ] Cannot create posts (button hidden)
- [ ] Cannot reply (shows message)
- [ ] Sees real student names
- [ ] "My Students" filter works
- [ ] Shows only assigned mentees when filtered

### Parent
- [ ] Cannot create posts (button hidden)
- [ ] Cannot reply (shows message)
- [ ] Sees real student names
- [ ] Child selector appears
- [ ] Defaults to showing their children
- [ ] Can select specific child

### Admin
- [ ] Cannot create posts (button hidden)
- [ ] Cannot reply (shows message)
- [ ] Sees real student names
- [ ] Subject filter works

## 🎉 Summary

Updated community system with:
- ✅ All 5 roles can view discussions
- ✅ Only students and teachers can post/reply
- ✅ Mentors have "My Students" filter
- ✅ Parents have child selector (defaults to their children)
- ✅ View-only banner for non-commenters
- ✅ Conditional UI elements based on permissions
- ✅ Real name visibility for mentors/parents/admins
- ✅ Anonymous nicknames for students/teachers

**Ready for all 3 community pages!**
