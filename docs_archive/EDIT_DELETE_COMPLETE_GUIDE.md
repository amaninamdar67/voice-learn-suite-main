# Complete Edit/Delete & 5 Community Pages Implementation Guide

## ✅ COMPLETED

### 1. Database Schema
- **File**: `database/17_add_edit_delete_community.sql`
- Added `edited_at` and `is_edited` columns
- Created automatic edit tracking triggers
- **Status**: Ready to run in Supabase

### 2. Backend API
- **File**: `backend/lms-routes.js`
- Added 4 endpoints:
  - PUT `/api/community/posts/:id`
  - DELETE `/api/community/posts/:id`
  - PUT `/api/community/replies/:id`
  - DELETE `/api/community/replies/:id`
- **Status**: Complete

- **File**: `backend/server.js`
- Imported and registered all community routes
- **Status**: Complete

### 3. Community Pages Created
- ✅ `src/pages/Community/RecordedClassesCommunity.tsx` (existing, needs edit/delete UI)
- ✅ `src/pages/Community/CoursesCommunity.tsx` (existing, needs edit/delete UI)
- ✅ `src/pages/Community/LiveClassesCommunity.tsx` (existing, needs edit/delete UI)
- ✅ `src/pages/Community/QuizzesCommunity.tsx` (created)
- ✅ `src/pages/Community/AssignmentsCommunity.tsx` (created)

## 🔧 TO COMPLETE

### Step 1: Run Database Migration
```bash
# In Supabase SQL Editor, run:
database/17_add_edit_delete_community.sql
```

### Step 2: Add Edit/Delete UI to ALL Community Pages

Add these handler functions to each community page (after existing handlers):

```typescript
const handleEditPost = (post: Post) => {
  setEditingPost(post.id);
  setEditContent(post.content);
  setEditTitle(post.title || '');
  setEditSubject(post.subject || '');
};

const handleSavePost = async (postId: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: editContent,
        title: editTitle,
        subject: editSubject,
      }),
    });
    if (!response.ok) throw new Error('Failed to update post');
    setEditingPost(null);
    fetchPosts();
    alert('Post updated successfully!');
  } catch (error) {
    console.error('Error updating post:', error);
    alert('Failed to update post');
  }
};

const handleDeletePost = async (postId: string) => {
  if (!confirm('Are you sure you want to delete this post?')) return;
  try {
    const response = await fetch(`http://localhost:3001/api/community/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
    fetchPosts();
    alert('Post deleted successfully!');
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post');
  }
};

const handleEditReply = (reply: Reply) => {
  setEditingReply(reply.id);
  setEditContent(reply.content);
};

const handleSaveReply = async (replyId: string, postId: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/community/replies/${replyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    if (!response.ok) throw new Error('Failed to update reply');
    setEditingReply(null);
    fetchReplies(postId);
    alert('Reply updated successfully!');
  } catch (error) {
    console.error('Error updating reply:', error);
    alert('Failed to update reply');
  }
};

const handleDeleteReply = async (replyId: string, postId: string) => {
  if (!confirm('Are you sure you want to delete this reply?')) return;
  try {
    const response = await fetch(`http://localhost:3001/api/community/replies/${replyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete reply');
    fetchReplies(postId);
    fetchPosts();
    alert('Reply deleted successfully!');
  } catch (error) {
    console.error('Error deleting reply:', error);
    alert('Failed to delete reply');
  }
};
```

### Step 3: Update Post Rendering UI

In the post rendering section, replace the content display with:

```tsx
{editingPost === post.id ? (
  // Edit Mode
  <div className="space-y-3">
    <input
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      placeholder="Title (optional)"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    />
    <input
      type="text"
      value={editSubject}
      onChange={(e) => setEditSubject(e.target.value)}
      placeholder="Subject (optional)"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    />
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      rows={4}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    />
    <div className="flex gap-2">
      <button
        onClick={() => handleSavePost(post.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Save
      </button>
      <button
        onClick={() => setEditingPost(null)}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
      <button
        onClick={() => handleDeletePost(post.id)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
) : (
  // View Mode
  <>
    {post.title && <h3 className="font-semibold text-lg mb-2">{post.title}</h3>}
    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
    {post.is_edited && (
      <span className="text-xs text-gray-500 italic mt-2 block">
        (edited {post.edited_at ? new Date(post.edited_at).toLocaleDateString() : ''})
      </span>
    )}
    {post.user_id === user?.id && (
      <button
        onClick={() => handleEditPost(post)}
        className="mt-2 text-gray-500 hover:text-blue-600 flex items-center gap-1"
      >
        <Edit2 size={16} />
        <span className="text-sm">Edit</span>
      </button>
    )}
  </>
)}
```

### Step 4: Update Reply Rendering UI

In the replies section, replace reply content with:

```tsx
{editingReply === reply.id ? (
  <div className="space-y-2">
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
    />
    <div className="flex gap-2">
      <button
        onClick={() => handleSaveReply(reply.id, post.id)}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Save
      </button>
      <button
        onClick={() => setEditingReply(null)}
        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
      >
        Cancel
      </button>
      <button
        onClick={() => handleDeleteReply(reply.id, post.id)}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 ml-auto"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
) : (
  <>
    <p className="text-gray-700 text-sm">{reply.content}</p>
    {reply.is_edited && (
      <span className="text-xs text-gray-400 italic">(edited)</span>
    )}
    {reply.user_id === user?.id && (
      <button
        onClick={() => handleEditReply(reply)}
        className="mt-1 text-gray-400 hover:text-blue-600 flex items-center gap-1"
      >
        <Edit2 size={12} />
        <span className="text-xs">Edit</span>
      </button>
    )}
  </>
)}
```

### Step 5: Update App.tsx Routes

Add these routes:

```tsx
// After existing community routes
<Route
  path="/community/quizzes"
  element={
    <PrivateRoute>
      <MainLayout>
        <QuizzesCommunity />
      </MainLayout>
    </PrivateRoute>
  }
/>
<Route
  path="/community/assignments"
  element={
    <PrivateRoute>
      <MainLayout>
        <AssignmentsCommunity />
      </MainLayout>
    </PrivateRoute>
  }
/>
```

And add imports:

```tsx
import QuizzesCommunity from "./pages/Community/QuizzesCommunity";
import AssignmentsCommunity from "./pages/Community/AssignmentsCommunity";
```

### Step 6: Update Sidebar Navigation

Add community links in Sidebar.tsx for all 5 modules:

```tsx
{/* Community Section */}
<div className="px-3 py-2">
  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
    Community
  </h3>
  <Link to="/community/courses" className="sidebar-link">
    <BookOpen size={20} />
    <span>Courses Discussion</span>
  </Link>
  <Link to="/community/recorded-classes" className="sidebar-link">
    <Video size={20} />
    <span>Recorded Classes</span>
  </Link>
  <Link to="/community/live-classes" className="sidebar-link">
    <Radio size={20} />
    <span>Live Classes</span>
  </Link>
  <Link to="/community/quizzes" className="sidebar-link">
    <Brain size={20} />
    <span>Quizzes Discussion</span>
  </Link>
  <Link to="/community/assignments" className="sidebar-link">
    <FileText size={20} />
    <span>Assignments Discussion</span>
  </Link>
</div>
```

## 📝 Summary

**What's Done:**
- ✅ Database schema with edit tracking
- ✅ Backend API endpoints for edit/delete
- ✅ All 5 community page files created
- ✅ Handler functions added to RecordedClassesCommunity

**What's Needed:**
1. Run database migration
2. Copy edit/delete handlers to other 4 community pages
3. Update UI in all 5 pages to show edit/delete buttons
4. Add routes in App.tsx
5. Add sidebar links

**Files to Update:**
- `src/pages/Community/CoursesCommunity.tsx`
- `src/pages/Community/LiveClassesCommunity.tsx`
- `src/pages/Community/QuizzesCommunity.tsx`
- `src/pages/Community/AssignmentsCommunity.tsx`
- `src/App.tsx`
- `src/components/Layout/Sidebar.tsx`
