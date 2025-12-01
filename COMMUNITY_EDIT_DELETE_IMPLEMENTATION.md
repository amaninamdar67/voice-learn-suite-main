# Community Edit/Delete & New Pages Implementation

## Changes Implemented

### 1. Database Schema Updates
- **File**: `database/17_add_edit_delete_community.sql`
- Added `edited_at` and `is_edited` columns to `community_posts` and `community_replies`
- Created triggers to automatically track edits

### 2. Backend API Routes
- **File**: `backend/lms-routes.js`
- Added 4 new endpoints:
  - `PUT /api/community/posts/:id` - Update post
  - `DELETE /api/community/posts/:id` - Delete post
  - `PUT /api/community/replies/:id` - Update reply
  - `DELETE /api/community/replies/:id` - Delete reply

- **File**: `backend/server.js`
- Registered the new community routes

### 3. Frontend Community Pages

#### New Pages to Create:
1. **QuizzesCommunity.tsx** - Discussion forum for quizzes
2. **AssignmentsCommunity.tsx** - Discussion forum for assignments

#### Features to Add to ALL Community Pages:
1. **Edit Functionality**:
   - Edit button (pencil icon) next to user's own posts/replies
   - Inline editing with save/cancel buttons
   - Shows "edited" badge if content was modified

2. **Delete Functionality**:
   - Delete button inside edit mode
   - Confirmation dialog before deletion
   - Only visible to post/reply owner

3. **UI Improvements**:
   - Edit icon appears on hover for own content
   - Edited timestamp display
   - Smooth transitions for edit mode

### 4. Routing Updates
- **File**: `src/App.tsx`
- Add routes for:
  - `/community/quizzes`
  - `/community/assignments`

### 5. Sidebar Navigation
- **File**: `src/components/Layout/Sidebar.tsx`
- Add community links for all 5 modules

## Implementation Steps

### Step 1: Run Database Migration
```sql
-- Run database/17_add_edit_delete_community.sql in Supabase SQL Editor
```

### Step 2: Update Existing Community Pages
Add edit/delete functionality to:
- RecordedClassesCommunity.tsx
- CoursesCommunity.tsx
- LiveClassesCommunity.tsx

### Step 3: Create New Community Pages
- QuizzesCommunity.tsx (category: 'quizzes')
- AssignmentsCommunity.tsx (category: 'assignments')

### Step 4: Update Routing
Add new routes in App.tsx

### Step 5: Update Sidebar
Add community menu items for all 5 modules

## Edit/Delete UI Pattern

```typescript
// State for editing
const [editingPost, setEditingPost] = useState<string | null>(null);
const [editContent, setEditContent] = useState('');

// Edit handler
const handleEditPost = async (postId: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/community/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    // Refresh posts
  } catch (error) {
    console.error('Error editing post:', error);
  }
};

// Delete handler
const handleDeletePost = async (postId: string) => {
  if (!confirm('Are you sure you want to delete this post?')) return;
  
  try {
    await fetch(`http://localhost:3001/api/community/posts/${postId}`, {
      method: 'DELETE',
    });
    // Refresh posts
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};
```

## Category Mapping
- Courses: `category: 'courses'`
- Recorded Classes: `category: 'recorded-classes'`
- Live Classes: `category: 'live-classes'`
- Quizzes: `category: 'quizzes'`
- Assignments: `category: 'assignments'`
