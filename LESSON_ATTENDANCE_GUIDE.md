# How Lesson Attendance Works

## Overview
The lesson attendance system automatically tracks student video watching progress in real-time using YouTube's IFrame API and stores the data in the `lesson_attendance` table.

---

## 🎯 Key Components

### 1. **CustomVideoPlayer Component**
Location: `src/components/VideoPlayer/CustomVideoPlayer.tsx`

**Features:**
- Embeds YouTube videos using IFrame API
- Tracks video progress every 5 seconds
- Sends progress updates via callbacks
- Auto-completes at 80% watch threshold

**How it works:**
```typescript
// Progress tracking interval (every 5 seconds)
progressIntervalRef.current = setInterval(() => {
  iframeRef.current?.contentWindow?.postMessage(
    '{"event":"command","func":"getCurrentTime","args":""}',
    '*'
  );
}, 5000);

// Listen for YouTube player messages
const handleMessage = (event: MessageEvent) => {
  if (event.origin !== 'https://www.youtube.com') return;
  
  const data = JSON.parse(event.data);
  
  // Get current time and duration
  if (data.info?.currentTime && data.info?.duration) {
    const currentTime = data.info.currentTime;
    const duration = data.info.duration;
    const percentage = (currentTime / duration) * 100;
    
    // Call onProgress callback
    if (onProgress) {
      onProgress(Math.floor(currentTime), percentage);
    }
    
    // Auto-complete at 80%
    if (percentage >= 80 && onComplete) {
      onComplete();
    }
  }
};
```

---

### 2. **VideoLessonsView Component**
Location: `src/pages/Student/VideoLessonsView.tsx`

**Handles:**
- Displaying video lessons
- Tracking watch progress
- Updating attendance in database
- Manual status management

**Progress Tracking Function:**
```typescript
const handleProgress = async (lessonId: string, seconds: number, percentage: number) => {
  try {
    await supabase
      .from('lesson_attendance')
      .upsert({
        student_id: user?.id,
        lesson_id: lessonId,
        watch_duration_seconds: Math.floor(seconds),
        watch_percentage: percentage,
        is_completed: percentage >= 80,  // ✅ Auto-complete at 80%
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,lesson_id'  // Update if exists
      });
    
    // Update local state for instant UI feedback
    setAttendance(prev => ({
      ...prev,
      [lessonId]: {
        watch_percentage: percentage,
        is_completed: percentage >= 80,
        last_watched_at: new Date().toISOString(),
      }
    }));
  } catch (error) {
    console.error('Error tracking progress:', error);
  }
};
```

---

## 📊 Database Schema

### `lesson_attendance` Table
```sql
CREATE TABLE lesson_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  lesson_id uuid references video_lessons(id) on delete cascade not null,
  watch_duration_seconds integer default 0,        -- Total seconds watched
  watch_percentage decimal(5,2) default 0,         -- 0.00 to 100.00
  is_completed boolean default false,              -- true if >= 80%
  last_watched_at timestamptz default now(),       -- Last watch timestamp
  manual_status text,                              -- 'todo', 'in-progress', 'completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  UNIQUE(student_id, lesson_id)                    -- One record per student per lesson
);
```

---

## 🔄 How Attendance is Tracked (Step-by-Step)

### Step 1: Student Opens Video
1. Student clicks on a video lesson card
2. Modal opens with `CustomVideoPlayer` component
3. YouTube video loads with IFrame API enabled

### Step 2: Automatic Progress Tracking
1. **Every 5 seconds**, the player requests current time from YouTube
2. YouTube responds with `currentTime` and `duration`
3. Player calculates `percentage = (currentTime / duration) * 100`
4. `onProgress` callback is triggered with `(seconds, percentage)`

### Step 3: Database Update
1. `handleProgress` function receives the data
2. **UPSERT** operation to `lesson_attendance` table:
   - If record exists → UPDATE
   - If record doesn't exist → INSERT
3. Updates:
   - `watch_duration_seconds`: Current position in video
   - `watch_percentage`: Percentage watched
   - `is_completed`: Automatically set to `true` if ≥ 80%
   - `last_watched_at`: Current timestamp

### Step 4: UI Updates
1. Local state updates immediately (optimistic update)
2. Progress bar shows current percentage
3. Badge shows "X% watched" or "Completed"
4. Green checkmark appears when completed

### Step 5: Auto-Completion
When video reaches **80% watched**:
- `is_completed` automatically set to `true`
- "Attendance Marked!" message appears
- Green badge shows on video card
- Points awarded in leaderboard system

---

## 🎨 Visual Indicators

### Video Card Badges
```typescript
// Completed Badge (Green)
{attendance[lesson.id]?.is_completed && (
  <div className="px-3 py-1 bg-green-500 text-white rounded-full">
    <CheckCircle size={14} />
    Completed
  </div>
)}

// In Progress Badge (Orange)
{attendance[lesson.id] && !attendance[lesson.id].is_completed && 
 attendance[lesson.id].watch_percentage > 0 && (
  <div className="px-3 py-1 bg-orange-500 text-white rounded-full">
    {Math.round(attendance[lesson.id].watch_percentage)}% watched
  </div>
)}
```

### Progress Bar
```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className={`h-2 rounded-full ${
      attendance[lesson.id].is_completed ? 'bg-green-600' : 'bg-blue-600'
    }`}
    style={{ width: `${attendance[lesson.id].watch_percentage}%` }}
  />
</div>
```

---

## 🎯 Manual Status Management

Students can also manually set their progress status:

```typescript
const handleManualStatusChange = async (lessonId: string, status: 'todo' | 'in-progress' | 'completed') => {
  await supabase
    .from('lesson_attendance')
    .upsert({
      student_id: user?.id,
      lesson_id: lessonId,
      manual_status: status,
      is_completed: status === 'completed',
      // ... other fields
    });
};
```

**Status Options:**
- 📋 **To-Do**: Not started
- ⏳ **In Progress**: Currently watching
- ✓ **Completed**: Finished watching

---

## 📈 Attendance in Leaderboard

### Points Calculation
From `src/pages/Student/OverallRankings.tsx`:

```typescript
// Video lesson attendance points (completed lessons)
const { data: videoAttendance } = await supabase
  .from('lesson_attendance')
  .select('is_completed')
  .eq('student_id', student.id)
  .eq('is_completed', true);

const attendancePoints = (videoAttendance?.length || 0) * 10; // 10 points per completed lesson
```

**Each completed video lesson = 10 points**

---

## 🔐 Security (RLS Policies)

### Students
- ✅ Can view their own attendance
- ✅ Can insert/update their own attendance
- ❌ Cannot view other students' attendance

### Teachers
- ✅ Can view attendance for their lessons
- ❌ Cannot modify student attendance

### Mentors
- ✅ Can view attendance for their mentees
- ❌ Cannot modify attendance

### Parents
- ✅ Can view their children's attendance
- ❌ Cannot modify attendance

### Admins
- ✅ Can view all attendance
- ✅ Full access

---

## 🚀 Real-Time Features

### Live Updates
- Progress tracked every 5 seconds
- Instant UI feedback (optimistic updates)
- Database synced in background
- No page refresh needed

### Persistence
- Progress saved even if student closes video
- Can resume from last watched position
- History maintained in `last_watched_at`

### Completion Threshold
- **80% watched = Attendance marked**
- Prevents gaming the system
- Ensures meaningful engagement

---

## 📱 User Experience Flow

1. **Browse Lessons** → See completion status on cards
2. **Click Video** → Modal opens with player
3. **Watch Video** → Progress tracked automatically
4. **See Progress** → Real-time progress bar updates
5. **Reach 80%** → "Attendance Marked!" message
6. **Close Modal** → Progress saved, badge updated
7. **View Leaderboard** → Points reflected immediately

---

## 🔧 Technical Details

### YouTube IFrame API Integration
- Uses `enablejsapi=1` parameter
- PostMessage API for communication
- Origin validation for security
- Handles player state changes

### Database Operations
- **UPSERT** prevents duplicates
- Unique constraint on `(student_id, lesson_id)`
- Timestamps for audit trail
- Optimized indexes for queries

### Performance
- Progress updates throttled to 5 seconds
- Local state for instant UI updates
- Batch operations where possible
- Efficient queries with proper indexes

---

## 🎓 Benefits

### For Students
- ✅ Automatic attendance tracking
- ✅ Visual progress indicators
- ✅ Resume from last position
- ✅ Earn points for completion

### For Teachers
- ✅ Real-time attendance data
- ✅ See which students watched
- ✅ Track engagement levels
- ✅ Identify struggling students

### For Mentors
- ✅ Monitor mentee progress
- ✅ See completion rates
- ✅ Track watch percentages
- ✅ Identify intervention needs

### For Parents
- ✅ Track child's learning
- ✅ See completed lessons
- ✅ Monitor engagement
- ✅ Support learning journey

---

## 🐛 Troubleshooting

### Progress Not Updating?
1. Check browser console for errors
2. Verify YouTube video is playable
3. Check network connection
4. Ensure RLS policies are correct

### Attendance Not Marking Complete?
1. Verify 80% threshold reached
2. Check `is_completed` field in database
3. Ensure `onComplete` callback firing
4. Check for JavaScript errors

### Data Not Syncing?
1. Verify Supabase connection
2. Check authentication status
3. Review RLS policies
4. Check database constraints

---

## 📝 Summary

The lesson attendance system provides:
- **Automatic tracking** via YouTube IFrame API
- **Real-time updates** every 5 seconds
- **80% completion threshold** for attendance
- **Visual progress indicators** for students
- **Comprehensive data** for teachers/mentors
- **Secure access** via RLS policies
- **Points system** for gamification

This creates an engaging, transparent, and fair attendance tracking system that benefits all stakeholders in the learning process.
