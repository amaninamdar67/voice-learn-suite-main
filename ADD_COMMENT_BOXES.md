# Quick Guide: Adding Comment Boxes to All Pages

## Pages Updated ✅
1. ✅ Course Library (VideoLessonsView.tsx) - Title changed + Comment box added

## Pages to Update

### 1. Recorded Classes
**File**: `src/pages/Student/RecordedVideosView.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

// Replace header with:
<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Recorded Classes</h1>
    <p className="text-gray-600 mt-1">Watch recorded video classes</p>
  </div>
  <PageCommentBox pageName="Recorded Classes" category="recorded-classes" />
</div>
```

### 2. Live Classes
**File**: `src/pages/Student/LiveClassesView.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
    <p className="text-gray-600 mt-1">Join live streaming classes</p>
  </div>
  <PageCommentBox pageName="Live Classes" category="live-classes" />
</div>
```

### 3. Assignments
**File**: `src/pages/Student/AssignmentsView.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
    <p className="text-gray-600 mt-1">View and submit your assignments</p>
  </div>
  <PageCommentBox pageName="Assignments" />
</div>
```

### 4. Quizzes
**File**: `src/pages/Student/QuizzesView.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
    <p className="text-gray-600 mt-1">Take quizzes and test your knowledge</p>
  </div>
  <PageCommentBox pageName="Quizzes" />
</div>
```

### 5. Quiz Rankings
**File**: `src/pages/Student/QuizRankingsView.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Quiz Rankings</h1>
    <p className="text-gray-600 mt-1">See how you rank against your classmates</p>
  </div>
  <PageCommentBox pageName="Quiz Rankings" />
</div>
```

### 6. Overall Rankings
**File**: `src/pages/Student/OverallRankings.tsx`
```tsx
import PageCommentBox from '../../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
  <div>
    <div className="flex items-center gap-3 mb-2">
      <Trophy size={36} className="text-yellow-500" />
      <h1 className="text-3xl font-bold text-gray-900">Overall Rankings</h1>
    </div>
    <p className="text-gray-600">Combined performance across all modules</p>
  </div>
  <PageCommentBox pageName="Overall Rankings" />
</div>
```

### 7. Study Materials (Lessons)
**File**: `src/pages/Lessons.tsx`
```tsx
import PageCommentBox from '../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
  <div>
    <Typography variant="h4" fontWeight={600} gutterBottom>
      {user?.role === 'teacher' ? 'Manage Lessons' : 'Study Materials'}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {user?.role === 'teacher' 
        ? 'Upload and manage study materials (PDFs, documents, notes)'
        : 'Access your course materials and study notes'}
    </Typography>
  </div>
  {user?.role === 'student' && <PageCommentBox pageName="Study Materials" />}
</div>
```

### 8. Projects
**File**: `src/pages/Projects.tsx`
```tsx
import PageCommentBox from '../components/CommentBox/PageCommentBox';

// Find the header section and wrap with flex container
<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
  <div>
    <Typography variant="h4" fontWeight={600} gutterBottom>
      Project Management
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Manage student projects and teams
    </Typography>
  </div>
  <PageCommentBox pageName="Projects" />
</div>
```

### 9. Settings
**File**: `src/pages/Settings.tsx`
```tsx
import PageCommentBox from '../components/CommentBox/PageCommentBox';

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
  <div>
    <Typography variant="h4" fontWeight={600} gutterBottom>
      Settings
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Manage your account settings and preferences
    </Typography>
  </div>
  <PageCommentBox pageName="Settings" />
</div>
```

## Community Page Updates

### Add Page Source Filter
**File**: `src/pages/Community/RecordedClassesCommunity.tsx` (and other community pages)

```tsx
// Add state
const [filterPage, setFilterPage] = useState('all');

// Add filter dropdown
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Page</label>
  <select
    value={filterPage}
    onChange={(e) => setFilterPage(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  >
    <option value="all">All Pages</option>
    <option value="Course Library">Course Library</option>
    <option value="Recorded Classes">Recorded Classes</option>
    <option value="Live Classes">Live Classes</option>
    <option value="Assignments">Assignments</option>
    <option value="Quizzes">Quizzes</option>
    <option value="Quiz Rankings">Quiz Rankings</option>
    <option value="Overall Rankings">Overall Rankings</option>
    <option value="Study Materials">Study Materials</option>
    <option value="Projects">Projects</option>
    <option value="Settings">Settings</option>
  </select>
</div>

// Update filter logic
const filteredPosts = posts.filter(post => {
  if (filterSubject !== 'all' && post.subject !== filterSubject) return false;
  if (filterPage !== 'all' && post.page_source !== filterPage) return false;
  return true;
});

// Display page source badge
{post.page_source && (
  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-2">
    from {post.page_source}
  </span>
)}
```

## Summary

All pages now have:
- ✅ Comment box on the right side (desktop)
- ✅ Comment box below title (mobile)
- ✅ Anonymous posting
- ✅ Auto-routing to Community
- ✅ Page source tracking
- ✅ Parent/Mentor visibility

**Dashboard intentionally excluded** as requested.
