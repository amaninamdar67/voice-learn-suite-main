# Dashboard Real Data Implementation Guide

## Summary
Your dashboards currently show static/fake data. This guide shows how to make them display real data from your Supabase database.

## Current Status
✅ All features are functional (quizzes, assignments, videos, etc.)
✅ Data is being saved to database
❌ Dashboards show static numbers instead of real counts

## What Needs to Change

### Student Dashboard
**Current (Static):**
- 12 Lessons (hardcoded)
- 8 Quizzes (hardcoded)
- 3 Projects (hardcoded)
- 63% Progress (hardcoded)

**Should Show (Real Data):**
- Count of video lessons watched
- Count of quizzes taken
- Count of assignments submitted
- Real progress percentage based on completion

### Teacher Dashboard
**Should Show:**
- Total students in their classes
- Total content uploaded (videos, quizzes, assignments)
- Recent student activity
- Pending submissions to grade

## Implementation Steps

### 1. Student Dashboard Real Data

```typescript
// Fetch real counts
const [stats, setStats] = useState({
  lessons: 0,
  quizzes: 0,
  assignments: 0,
  progress: 0
});

useEffect(() => {
  fetchDashboardData();
}, [user]);

const fetchDashboardData = async () => {
  // Count watched videos
  const { count: videosCount } = await supabase
    .from('video_watch_history')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id);

  // Count quiz attempts
  const { count: quizzesCount } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id);

  // Count assignment submissions
  const { count: assignmentsCount } = await supabase
    .from('assignment_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id);

  // Calculate progress
  const { data: completedVideos } = await supabase
    .from('video_watch_history')
    .select('*')
    .eq('student_id', user.id)
    .eq('is_completed', true);

  const { data: totalVideos } = await supabase
    .from('video_lessons')
    .select('id');

  const progress = totalVideos?.length > 0 
    ? (completedVideos?.length / totalVideos.length) * 100 
    : 0;

  setStats({
    lessons: videosCount || 0,
    quizzes: quizzesCount || 0,
    assignments: assignmentsCount || 0,
    progress: Math.round(progress)
  });
};
```

### 2. Teacher Dashboard Real Data

```typescript
const fetchTeacherStats = async () => {
  // Count students (if you track this)
  const { count: studentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  // Count uploaded videos
  const { count: videosCount } = await supabase
    .from('recorded_videos')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  // Count created quizzes
  const { count: quizzesCount } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  // Count assignments
  const { count: assignmentsCount } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', user.id);

  // Count pending submissions
  const { count: pendingCount } = await supabase
    .from('assignment_submissions')
    .select('*, assignments!inner(*)', { count: 'exact', head: true })
    .eq('assignments.teacher_id', user.id)
    .eq('status', 'submitted');

  setStats({
    students: studentsCount || 0,
    videos: videosCount || 0,
    quizzes: quizzesCount || 0,
    assignments: assignmentsCount || 0,
    pending: pendingCount || 0
  });
};
```

### 3. Recent Activity Feed

```typescript
// Fetch recent lessons/activities
const { data: recentVideos } = await supabase
  .from('video_watch_history')
  .select(`
    *,
    video:video_lessons(title)
  `)
  .eq('student_id', user.id)
  .order('last_watched_at', { ascending: false })
  .limit(5);

// Fetch recent quiz attempts
const { data: recentQuizzes } = await supabase
  .from('quiz_attempts')
  .select(`
    *,
    quiz:quizzes(title)
  `)
  .eq('student_id', user.id)
  .order('submitted_at', { ascending: false })
  .limit(5);
```

### 4. Progress Tracking

```typescript
// This Week Stats
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const { data: thisWeekActivity } = await supabase
  .from('video_watch_history')
  .select('*')
  .eq('student_id', user.id)
  .gte('last_watched_at', oneWeekAgo.toISOString());

const lessonsThisWeek = thisWeekActivity?.length || 0;

// Quiz performance
const { data: quizResults } = await supabase
  .from('quiz_attempts')
  .select('score, total_marks')
  .eq('student_id', user.id)
  .gte('submitted_at', oneWeekAgo.toISOString());

const quizzesPassed = quizResults?.filter(q => 
  (q.score / q.total_marks) >= 0.6
).length || 0;
```

## Quick Implementation

Since this is extensive, here's the priority order:

### Phase 1: Basic Counts (30 min)
1. Replace static numbers with database counts
2. Show real lesson/quiz/assignment counts
3. Calculate actual progress percentage

### Phase 2: Recent Activity (20 min)
1. Fetch last 5 activities
2. Show "Continue Learning" with real data
3. Display actual completion status

### Phase 3: This Week Stats (15 min)
1. Calculate weekly activity
2. Show real "This Week" numbers
3. Update progress indicators

## Files to Modify

1. `src/pages/Student/StudentDashboard.tsx` - Student dashboard
2. `src/pages/Teacher/TeacherDashboard.tsx` - Teacher dashboard
3. `src/pages/Admin/AdminDashboard.tsx` - Admin dashboard (optional)

## Database Tables Used

- `video_watch_history` - Video viewing data
- `quiz_attempts` - Quiz completion data
- `assignment_submissions` - Assignment submissions
- `recorded_videos` - Teacher's uploaded videos
- `quizzes` - Created quizzes
- `assignments` - Created assignments
- `profiles` - User information

## Testing

After implementation:
1. Take a quiz → Dashboard quiz count should increase
2. Watch a video → Dashboard lesson count should increase
3. Submit assignment → Dashboard assignment count should increase
4. Check progress bar → Should reflect actual completion

## Benefits

✅ Real-time data updates
✅ Accurate progress tracking
✅ Motivates students with real achievements
✅ Teachers see actual class activity
✅ No more fake/static numbers

## Next Steps

Would you like me to:
1. Implement the student dashboard with real data?
2. Implement the teacher dashboard with real data?
3. Create a complete working example for both?

The implementation is straightforward - just replacing static numbers with Supabase queries!
