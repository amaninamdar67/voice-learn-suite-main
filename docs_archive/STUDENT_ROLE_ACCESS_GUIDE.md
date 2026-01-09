# How Student Role Access Works - Complete Flow

Step-by-step guide showing exactly how a student gets role-based access after login.

---

## Login Flow - Step by Step

### Step 1: User Enters Credentials
**File:** `src/pages/Login.tsx`

```typescript
// User enters email and password
const handleSubmit = async (e: React.FormEvent) => {
  await login(email, password);
  navigate('/dashboard');
};
```

### Step 2: Authentication Happens
**File:** `src/contexts/AuthContext.tsx`

```typescript
const login = async (email: string, password: string) => {
  // Call Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data.user) {
    // User authenticated, now load their profile
    await loadUserProfile(data.user.id);
  }
};
```

**What happens:**
- Supabase verifies email/password
- If correct, returns user ID
- If wrong, throws error

### Step 3: Load User Profile (THIS IS WHERE ROLE IS RETRIEVED)
**File:** `src/contexts/AuthContext.tsx`

```typescript
const loadUserProfile = async (userId: string) => {
  // Query the profiles table to get user's role
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileData) {
    // Extract role from profile
    setProfile(profileData);
    setUser({
      id: profileData.id,
      name: profileData.full_name,
      email: authUser.user?.email || '',
      role: profileData.role as UserRole,  // ← ROLE IS SET HERE
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.full_name}`,
    });
  }
};
```

**What happens:**
1. Queries `profiles` table with user ID
2. Gets all user data including `role` column
3. Sets role in Auth context (e.g., "student", "teacher", "mentor")
4. Now `useAuth()` hook has access to user's role

### Step 4: User Redirected to Dashboard
**File:** `src/pages/Login.tsx`

```typescript
navigate('/dashboard');
```

### Step 5: Dashboard Component Checks Role
**File:** `src/pages/Dashboard.tsx` (or role-specific dashboard)

```typescript
export default function Dashboard() {
  const { user } = useAuth();
  
  // Check user's role
  if (user?.role === 'student') {
    return <StudentDashboard />;
  } else if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user?.role === 'mentor') {
    return <MentorDashboard />;
  }
  // ... etc
}
```

---

## Where Role is Stored

### Database: `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT,  -- ← ROLE STORED HERE
  student_id TEXT,
  employee_id TEXT,
  grade TEXT,
  section TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Role values:**
- `'student'`
- `'teacher'`
- `'mentor'`
- `'parent'`
- `'admin'`
- `'super_admin'`

### Example Profile Record

```json
{
  "id": "user-123",
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "student_id": "STU001",
  "grade": "10",
  "section": "A",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

## How Student Gets Access to Student Pages

### Step 1: Check Role in Component

**File:** `src/pages/Student/StudentDashboard.tsx`

```typescript
export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Only students can see this
  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" />;
  }
  
  // Rest of student dashboard code
}
```

### Step 2: Query Student-Specific Data

```typescript
const fetchDashboardData = async () => {
  // Get videos watched by THIS student
  const { data: videos } = await supabase
    .from('video_watch_history')
    .select('*')
    .eq('student_id', user.id);  // ← Only this student's data
  
  // Get quizzes taken by THIS student
  const { data: quizzes } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('student_id', user.id);  // ← Only this student's data
};
```

### Step 3: Row-Level Security (RLS) Enforces Access

**File:** `database/FIX_RLS_POLICIES.sql`

```sql
-- RLS Policy: Students can only see their own data
CREATE POLICY "Students can view own data"
  ON video_watch_history
  FOR SELECT
  USING (student_id = auth.uid());

-- This means:
-- - Student with ID "user-123" can only see records where student_id = "user-123"
-- - Even if they try to query another student's data, database blocks it
-- - This is enforced at DATABASE LEVEL, not just frontend
```

---

## Complete Access Flow Diagram

```
1. User Logs In
   ↓
2. Email/Password Verified (Supabase Auth)
   ↓
3. User ID Retrieved
   ↓
4. Query profiles table with User ID
   ↓
5. Get User's Role (e.g., "student")
   ↓
6. Set Role in Auth Context
   ↓
7. Navigate to /dashboard
   ↓
8. Dashboard Component Checks Role
   ↓
9. If role = "student", show StudentDashboard
   ↓
10. StudentDashboard Queries Student-Specific Data
    (Only this student's videos, quizzes, assignments)
   ↓
11. RLS Policies Enforce Database-Level Access
    (Database blocks access to other students' data)
   ↓
12. Student Sees Only Their Data
```

---

## Code Example: Complete Student Login Flow

### 1. User Logs In

```typescript
// src/pages/Login.tsx
const handleSubmit = async (e: React.FormEvent) => {
  await login('student@example.com', 'password123');
  navigate('/dashboard');
};
```

### 2. AuthContext Authenticates

```typescript
// src/contexts/AuthContext.tsx
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (data.user) {
    await loadUserProfile(data.user.id);
  }
};
```

### 3. Profile Loaded with Role

```typescript
// src/contexts/AuthContext.tsx
const loadUserProfile = async (userId: string) => {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // profileData now contains:
  // {
  //   id: 'user-123',
  //   full_name: 'John Doe',
  //   role: 'student',  ← ROLE IS HERE
  //   student_id: 'STU001',
  //   ...
  // }

  setUser({
    id: profileData.id,
    name: profileData.full_name,
    role: profileData.role,  // 'student'
    email: authUser.user?.email,
  });
};
```

### 4. Dashboard Routes Based on Role

```typescript
// src/pages/Dashboard.tsx
export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'student') {
    return <StudentDashboard />;
  } else if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }
  // ...
}
```

### 5. StudentDashboard Shows Student Data

```typescript
// src/pages/Student/StudentDashboard.tsx
export default function StudentDashboard() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Fetch only this student's data
    const { data } = await supabase
      .from('video_watch_history')
      .select('*')
      .eq('student_id', user.id);  // ← Only this student
    
    setVideos(data);
  }, [user.id]);
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Videos Watched: {videos.length}</p>
      {/* Show student-specific content */}
    </div>
  );
}
```

---

## How to Check Current User's Role

### In Any Component

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const MyComponent = () => {
  const { user } = useAuth();
  
  console.log('Current user role:', user?.role);
  
  // Check if student
  if (user?.role === 'student') {
    return <div>Student content</div>;
  }
  
  // Check if teacher
  if (user?.role === 'teacher') {
    return <div>Teacher content</div>;
  }
  
  return <div>Other role</div>;
};
```

---

## Student-Specific Pages

| Page | File | What Student Can Do |
|------|------|---------------------|
| Dashboard | `src/pages/Student/StudentDashboard.tsx` | View progress, stats, recent activity |
| Video Lessons | `src/pages/Student/VideoLessonsView.tsx` | Watch lessons, track progress |
| Recorded Videos | `src/pages/Student/RecordedVideosView.tsx` | Watch recorded classes |
| Live Classes | `src/pages/Student/LiveClassesView.tsx` | Join live classes |
| Quizzes | `src/pages/Student/QuizzesView.tsx` | Take quizzes |
| Quiz Rankings | `src/pages/Student/QuizRankingsView.tsx` | View rankings |
| Overall Rankings | `src/pages/Student/OverallRankings.tsx` | View overall performance |
| Assignments | `src/pages/Student/AssignmentsView.tsx` | Submit assignments |
| Mentoring | `src/pages/Student/StudentMentoringView.tsx` | Chat with mentor |

---

## Student Data Access Control

### What Student Can See

```typescript
// Only their own data
- Their videos watched
- Their quiz results
- Their assignments
- Their messages
- Their progress
- Their rankings (compared to others)
```

### What Student CANNOT See

```typescript
// Other students' data
- Other students' quiz results
- Other students' assignments
- Other students' messages
- Other students' progress

// Teacher/Admin data
- Teacher's content creation tools
- Admin settings
- System configuration
```

---

## Database RLS Policies for Students

### Policy 1: View Own Profile

```sql
CREATE POLICY "Students can view own profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid() OR role = 'admin');
```

### Policy 2: View Own Quiz Results

```sql
CREATE POLICY "Students can view own quiz results"
  ON quiz_results
  FOR SELECT
  USING (student_id = auth.uid());
```

### Policy 3: View Own Video History

```sql
CREATE POLICY "Students can view own video history"
  ON video_watch_history
  FOR SELECT
  USING (student_id = auth.uid());
```

### Policy 4: Submit Own Assignments

```sql
CREATE POLICY "Students can submit own assignments"
  ON assignment_submissions
  FOR INSERT
  WITH CHECK (student_id = auth.uid());
```

---

## Testing Student Access

### Test 1: Login as Student

```bash
# Use student credentials
Email: student@example.com
Password: password123

# Should see StudentDashboard
```

### Test 2: Check Role in Console

```javascript
// Open browser console (F12)
// In any page, run:
const { user } = useAuth();
console.log(user.role);  // Should print "student"
```

### Test 3: Try to Access Teacher Page

```typescript
// Try to navigate to /teacher/dashboard
// Should be redirected to /dashboard
// Because role is "student", not "teacher"
```

### Test 4: Check Database

```sql
-- In Supabase SQL Editor
SELECT id, full_name, role FROM profiles WHERE email = 'student@example.com';

-- Should show:
-- id: user-123
-- full_name: John Doe
-- role: student
```

---

## Troubleshooting

### Q: Student can see teacher pages
**A:** Check RLS policies are enabled in Supabase dashboard

### Q: Role is not loading after login
**A:** Check `profiles` table has `role` column with correct value

### Q: Student sees other students' data
**A:** Check RLS policies are correctly filtering by `student_id = auth.uid()`

### Q: Role shows as null
**A:** Check profile record exists in database for this user

### Q: Can't access student dashboard
**A:** Check user's role is exactly `'student'` (case-sensitive)

---

## Summary

**Student Role Access Flow:**

1. **Login** → Email/password verified
2. **Load Profile** → Query `profiles` table, get `role = 'student'`
3. **Set Context** → Store role in Auth context
4. **Route** → Navigate to StudentDashboard
5. **Query Data** → Fetch only this student's data
6. **RLS Enforces** → Database blocks access to other students' data
7. **Display** → Show student-specific UI

**Key Points:**
- Role stored in `profiles.role` column
- Role retrieved after login via `loadUserProfile()`
- Role checked in components to show/hide features
- RLS policies enforce database-level access control
- Student can only see their own data
