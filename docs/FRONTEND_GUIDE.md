# Frontend Architecture - Complete Guide

Comprehensive explanation of the entire frontend system, structure, and how everything works together.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Core Architecture](#core-architecture)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [Routing System](#routing-system)
7. [Components](#components)
8. [Pages](#pages)
9. [Hooks](#hooks)
10. [API Integration](#api-integration)
11. [Database Connection](#database-connection)
12. [UI Framework](#ui-framework)
13. [Development Workflow](#development-workflow)

---

## Project Structure

```
src/
├── App.tsx                          # Main app component with routing
├── main.tsx                         # Entry point
├── vite-env.d.ts                    # Vite environment types
├── theme/
│   └── theme.ts                     # Material-UI theme configuration
├── types/
│   └── index.ts                     # TypeScript type definitions
├── lib/
│   └── supabase.ts                  # Supabase client initialization
├── contexts/
│   ├── AuthContext.tsx              # Authentication state & logic
│   ├── ThemeContext.tsx             # Dark/light mode state
│   └── SystemConfigContext.tsx      # System configuration state
├── hooks/
│   ├── useVoiceContent.ts           # Voice input/output
│   ├── useWhisperVoiceNavigation.ts # Whisper speech-to-text
│   ├── useEnhancedVoiceNavigation.ts # Advanced voice commands
│   ├── useDocumentReader.ts         # Document reading
│   └── useAITutorAnalysis.ts        # AI tutor logic
├── components/
│   ├── Layout/
│   │   ├── MainLayout.tsx           # Main page wrapper
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── TopBar.tsx               # Header with user info
│   │   └── NotificationPanel.tsx    # Notifications display
│   ├── AITutor/
│   │   ├── AITutorNew.tsx           # Main AI chat (text-based)
│   │   └── AITutorEnhanced.tsx      # Enhanced AI with voice/images
│   ├── VideoPlayer/
│   │   └── CustomVideoPlayer.tsx    # Video player component
│   ├── Leaderboard/
│   │   └── AssignmentLeaderboard.tsx # Rankings display
│   ├── CommentBox/
│   │   └── PageCommentBox.tsx       # Comment system
│   ├── MentorParent/
│   │   ├── MentorParentChat.tsx     # Chat component
│   │   └── StudentAnalyticsDashboard.tsx # Analytics
│   ├── CommunicationSidebar/
│   │   └── CommunicationSidebar.tsx # Messaging sidebar
│   ├── VoiceSettings/
│   │   └── VoiceSettingsPanel.tsx   # Voice configuration
│   ├── DocumentCard/
│   │   └── DocumentCardWithAI.tsx   # Document display with AI
│   └── ui/                          # shadcn-ui components
├── pages/
│   ├── Login.tsx                    # Login page
│   ├── Dashboard.tsx                # Main dashboard (role-based)
│   ├── Lessons.tsx                  # Lessons page
│   ├── Quizzes.tsx                  # Quizzes page
│   ├── Settings.tsx                 # User settings
│   ├── Messages.tsx                 # Messaging page
│   ├── Announcement.tsx             # Announcements page
│   ├── NotFound.tsx                 # 404 page
│   ├── Student/
│   │   ├── StudentDashboard.tsx     # Student home
│   │   ├── VideoLessonsView.tsx     # Video lessons
│   │   ├── RecordedVideosView.tsx   # Recorded classes
│   │   ├── LiveClassesView.tsx      # Live classes
│   │   ├── QuizzesView.tsx          # Quizzes
│   │   ├── QuizRankingsView.tsx     # Quiz rankings
│   │   ├── OverallRankings.tsx      # Overall rankings
│   │   ├── AssignmentsView.tsx      # Assignments
│   │   └── StudentMentoringView.tsx # Mentoring
│   ├── Teacher/
│   │   ├── TeacherDashboard.tsx     # Teacher home
│   │   ├── VideoLessonUpload.tsx    # Upload video lessons
│   │   ├── RecordedVideosUpload.tsx # Upload recorded videos
│   │   ├── LiveClassCreator.tsx     # Create live classes
│   │   ├── QuizCreatorNew.tsx       # Create quizzes
│   │   ├── QuizRankingsDashboard.tsx # View rankings
│   │   ├── AssignmentCreator.tsx    # Create assignments
│   │   ├── OverallRankingsDashboard.tsx # Overall rankings
│   │   └── LessonUpload.tsx         # Upload lessons
│   ├── Mentor/
│   │   ├── MentorDashboard.tsx      # Mentor home
│   │   ├── MentoringView.tsx        # Mentoring sessions
│   │   ├── MentorMessages.tsx       # Mentor messaging
│   │   └── MentorCommunity.tsx      # Community
│   ├── Parent/
│   │   ├── ParentDashboard.tsx      # Parent home
│   │   ├── ChildrenView.tsx         # View children
│   │   ├── ChildrenViewRealTime.tsx # Real-time updates
│   │   └── ParentMentorCommunication.tsx # Mentor chat
│   ├── Admin/
│   │   ├── AdminDashboard.tsx       # Admin home
│   │   ├── UserManagement.tsx       # Manage users
│   │   ├── Analytics.tsx            # System analytics
│   │   ├── SystemConfig.tsx         # System settings
│   │   ├── DomainManagement.tsx     # Domain management
│   │   ├── LinkAccount.tsx          # Link accounts
│   │   ├── ParentStudentMentorLinking.tsx # Link relationships
│   │   ├── MentorStudentLinking.tsx # Link mentors
│   │   └── ParentChildLinking.tsx   # Link parents
│   └── Community/
│       ├── RecordedClassesCommunity.tsx # Recorded classes
│       ├── CoursesCommunity.tsx     # Courses
│       ├── LiveClassesCommunity.tsx # Live classes
│       ├── QuizzesCommunity.tsx     # Quizzes
│       └── AssignmentsCommunity.tsx # Assignments
└── backup-web-speech-api/
    └── README.md                    # Web Speech API backup
```

---

## Technology Stack

### Core Framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### UI & Styling
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Utility-first styling
- **shadcn-ui** - Pre-built components
- **Sonner** - Toast notifications

### State Management
- **React Context API** - Global state (Auth, Theme, Config)
- **React Query** - Server state management
- **localStorage** - Client-side persistence

### Database & Auth
- **Supabase** - PostgreSQL database
- **Supabase Auth** - JWT authentication
- **Supabase Realtime** - Real-time subscriptions

### Voice & AI
- **Web Speech API** - Browser-native voice
- **Whisper** - Speech-to-text
- **Groq SDK** - AI text analysis
- **Google Generative AI** - Image analysis

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Tailwind CSS** - CSS framework

---

## Core Architecture

### Application Flow

```
User Opens App
    ↓
Vite Dev Server (localhost:8080)
    ↓
App.tsx Loads
    ↓
Providers Initialize:
  - QueryClientProvider (React Query)
  - ThemeProvider (Material-UI)
  - TooltipProvider (UI)
  - AuthProvider (Authentication)
  - SystemConfigProvider (Config)
    ↓
BrowserRouter (React Router)
    ↓
Routes Evaluate
    ↓
PrivateRoute Check:
  - If authenticated → Show page
  - If not authenticated → Redirect to /login
    ↓
MainLayout Wraps Page:
  - TopBar (header)
  - Sidebar (navigation)
  - Main Content Area
    ↓
Page Component Renders
    ↓
Components Render
    ↓
User Interacts
```

### Component Hierarchy

```
App
├── QueryClientProvider
├── ThemeProvider
│   └── MuiThemeProvider
├── TooltipProvider
├── AuthProvider
│   └── SystemConfigProvider
│       ├── AITutorNew (floating)
│       └── BrowserRouter
│           └── Routes
│               ├── /login → Login
│               └── /dashboard → PrivateRoute
│                   └── MainLayout
│                       ├── TopBar
│                       ├── Sidebar
│                       └── Main Content
│                           └── Page Component
```

---

## Authentication Flow

### How Authentication Works

**Step 1: User Logs In**
```typescript
// src/pages/Login.tsx
const handleSubmit = async (e: React.FormEvent) => {
  await login(email, password);
  navigate('/dashboard');
};
```

**Step 2: AuthContext Authenticates**
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

**Step 3: Load User Profile**
```typescript
// Query profiles table to get user's role and info
const { data: profileData } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Set user in context
setUser({
  id: profileData.id,
  name: profileData.full_name,
  email: authUser.user?.email,
  role: profileData.role,  // 'student', 'teacher', etc.
  avatar: generateAvatar(profileData.full_name),
});
```

**Step 4: Session Persisted**
```typescript
// Supabase automatically persists session in localStorage
// On page refresh, session is restored
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadUserProfile(session.user.id);
    }
  });
}, []);
```

**Step 5: Protected Routes Check**
```typescript
// src/App.tsx
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Usage
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </PrivateRoute>
  }
/>
```

### User Roles & Access

**6 User Roles:**
1. **super_admin** - System-wide control
2. **admin** - Organization management
3. **teacher** - Content creation
4. **student** - Learning
5. **mentor** - Student guidance
6. **parent** - Child tracking

**Role-Based Access:**
```typescript
// In components, check user role
const { user } = useAuth();

if (user?.role === 'student') {
  return <StudentDashboard />;
} else if (user?.role === 'teacher') {
  return <TeacherDashboard />;
}
```

---

## State Management

### 1. AuthContext - Authentication State

**What it manages:**
- Current user info
- User profile
- Authentication status
- Login/logout functions

**How to use:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, profile, login, logout, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome {user?.name}</div>;
};
```

### 2. ThemeContext - Dark/Light Mode

**What it manages:**
- Dark mode toggle
- Theme preference
- localStorage persistence

**How to use:**
```typescript
import { useThemeContext } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { isDarkMode, toggleDarkMode } = useThemeContext();
  
  return (
    <button onClick={toggleDarkMode}>
      Current: {isDarkMode ? 'Dark' : 'Light'}
    </button>
  );
};
```

### 3. SystemConfigContext - System Configuration

**What it manages:**
- Feature flags
- System settings
- Configuration options

**How to use:**
```typescript
import { useSystemConfig } from '@/contexts/SystemConfigContext';

const MyComponent = () => {
  const { isFeatureEnabled } = useSystemConfig();
  
  if (isFeatureEnabled('ai_tutor')) {
    return <AITutorNew />;
  }
};
```

### 4. React Query - Server State

**What it manages:**
- API responses
- Caching
- Synchronization

**How to use:**
```typescript
import { useQuery } from '@tanstack/react-query';

const MyComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('*');
      return data;
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.length} lessons</div>;
};
```

### 5. localStorage - Client Persistence

**What it stores:**
- Dark mode preference
- User preferences
- Session data (Supabase)

**How to use:**
```typescript
// Save
localStorage.setItem('darkMode', 'true');

// Load
const darkMode = localStorage.getItem('darkMode') === 'true';

// Remove
localStorage.removeItem('darkMode');
```

---

## Routing System

### Route Structure

**Public Routes:**
- `/login` - Login page

**Protected Routes (require authentication):**
- `/dashboard` - Main dashboard
- `/lessons` - Lessons page
- `/quizzes` - Quizzes page
- `/messages` - Messaging
- `/settings` - User settings

**Student Routes:**
- `/student/video-lessons` - Video lessons
- `/student/recorded-videos` - Recorded classes
- `/student/live-classes` - Live classes
- `/student/quizzes` - Quizzes
- `/student/quiz-rankings` - Rankings

**Teacher Routes:**
- `/teacher/video-lessons` - Upload videos
- `/teacher/recorded-videos` - Upload recorded
- `/teacher/live-classes` - Create live classes
- `/teacher/quiz-creator` - Create quizzes
- `/teacher/quiz-rankings` - View rankings

**Mentor Routes:**
- `/mentor/messages` - Messaging
- `/mentor/community` - Community

**Parent Routes:**
- `/children` - View children
- `/parent/mentor-communication` - Chat with mentor

**Admin Routes:**
- `/users` - User management
- `/analytics` - Analytics
- `/system-config` - System configuration
- `/domains` - Domain management

**Community Routes:**
- `/community/recorded-classes` - Recorded classes
- `/community/courses` - Courses
- `/community/live-classes` - Live classes
- `/community/quizzes` - Quizzes
- `/community/assignments` - Assignments

### How Routing Works

```typescript
// src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </PrivateRoute>
      }
    />
    
    {/* More routes... */}
  </Routes>
</BrowserRouter>
```

### Navigation

**Using React Router:**
```typescript
import { useNavigate, Link } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  // Programmatic navigation
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  // Link component
  return (
    <>
      <button onClick={handleClick}>Go to Dashboard</button>
      <Link to="/lessons">View Lessons</Link>
    </>
  );
};
```

---

## Components

### Layout Components

**MainLayout** - Main page wrapper
- Wraps all authenticated pages
- Contains TopBar, Sidebar, main content
- Handles breadcrumbs

**TopBar** - Header component
- User info and avatar
- Notifications
- Dark mode toggle
- Logout button

**Sidebar** - Navigation sidebar
- Role-based menu items
- Navigation links
- Collapsible sections

**NotificationPanel** - Notifications display
- Toast notifications
- System alerts
- Real-time updates

### AI Components

**AITutorNew** - Main AI chat interface
- Text-based Q&A
- Groq API integration
- Chat history
- Voice input/output

**AITutorEnhanced** - Enhanced AI with features
- Image analysis
- Document analysis
- Multiple AI providers
- Advanced voice

### Feature Components

**CustomVideoPlayer** - Video player
- Play/pause controls
- Progress bar
- Volume control
- Fullscreen

**AssignmentLeaderboard** - Rankings display
- Student rankings
- Scores
- Sorting

**PageCommentBox** - Comment system
- Add comments
- View comments
- Delete comments

**MentorParentChat** - Chat component
- Send messages
- View conversation
- Real-time updates

**StudentAnalyticsDashboard** - Analytics
- Progress charts
- Performance metrics
- Statistics

**CommunicationSidebar** - Messaging sidebar
- Recent conversations
- Quick access
- Notifications

**VoiceSettingsPanel** - Voice configuration
- Language selection
- Voice settings
- Microphone control

**DocumentCardWithAI** - Document display
- Document preview
- AI analysis
- Comments

---

## Pages

### Authentication Pages

**Login.tsx**
- Email/password input
- Login button
- Error handling
- Redirect to dashboard on success

### Dashboard Pages

**Dashboard.tsx** - Role-based dashboard
- Redirects to role-specific dashboard
- Shows user info
- Quick access links

**StudentDashboard.tsx** - Student home
- Progress overview
- Recent activity
- Quick links to lessons, quizzes
- AI tutor access

**TeacherDashboard.tsx** - Teacher home
- Class management
- Student analytics
- Content creation links
- Announcements

**MentorDashboard.tsx** - Mentor home
- Student list
- Mentoring sessions
- Messages
- Analytics

**ParentDashboard.tsx** - Parent home
- Children list
- Progress tracking
- Mentor communication
- Announcements

**AdminDashboard.tsx** - Admin home
- System overview
- User management
- Analytics
- Configuration

### Content Pages

**VideoLessonsView.tsx** - View video lessons
- List of lessons
- Video player
- Progress tracking
- Comments

**QuizzesView.tsx** - View quizzes
- Quiz list
- Take quiz
- View results
- Rankings

**AssignmentsView.tsx** - View assignments
- Assignment list
- Submit assignment
- View feedback
- Grades

**RecordedVideosView.tsx** - View recorded classes
- List of recordings
- Video player
- Comments
- Attendance

**LiveClassesView.tsx** - View live classes
- Upcoming classes
- Join class
- Chat
- Recording

### Management Pages

**UserManagement.tsx** - Manage users
- User list
- Add/edit/delete users
- Role assignment
- Status management

**Analytics.tsx** - System analytics
- Charts and graphs
- Performance metrics
- User statistics
- Activity logs

**SystemConfig.tsx** - System configuration
- Feature flags
- Settings
- Configuration options

**DomainManagement.tsx** - Manage domains
- Domain list
- Add/edit/delete domains
- Subdomain management

---

## Hooks

### Custom Hooks

**useAuth()** - Authentication hook
```typescript
const { user, profile, login, logout, isAuthenticated, loading } = useAuth();
```

**useThemeContext()** - Theme hook
```typescript
const { isDarkMode, toggleDarkMode } = useThemeContext();
```

**useSystemConfig()** - System config hook
```typescript
const { isFeatureEnabled } = useSystemConfig();
```

**useVoiceContent()** - Voice input/output
```typescript
const { startListening, stopListening, transcript, speak } = useVoiceContent();
```

**useWhisperVoiceNavigation()** - Whisper integration
```typescript
const { startRecording, stopRecording, transcript } = useWhisperVoiceNavigation();
```

**useEnhancedVoiceNavigation()** - Advanced voice
```typescript
const { startListening, commands } = useEnhancedVoiceNavigation();
```

**useDocumentReader()** - Document reading
```typescript
const { readDocument, stop } = useDocumentReader();
```

**useAITutorAnalysis()** - AI tutor logic
```typescript
const { analyze, response, loading } = useAITutorAnalysis();
```

### React Hooks

**useState()** - Local state
```typescript
const [count, setCount] = useState(0);
```

**useEffect()** - Side effects
```typescript
useEffect(() => {
  // Run on mount
  return () => {
    // Cleanup on unmount
  };
}, [dependencies]);
```

**useContext()** - Access context
```typescript
const { user } = useContext(AuthContext);
```

**useQuery()** - Fetch data
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: async () => { /* fetch */ },
});
```

---

## API Integration

### Making API Calls

**Using Fetch:**
```typescript
const response = await fetch('/api/groq/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});

const data = await response.json();
```

**Using Supabase Client:**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('lessons')
  .select('*')
  .eq('teacher_id', userId);
```

**Using React Query:**
```typescript
const { data } = useQuery({
  queryKey: ['lessons'],
  queryFn: async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*');
    return data;
  },
});
```

### API Endpoints Used

**AI Endpoints:**
- `POST /api/groq/chat` - Groq text analysis
- `POST /api/gemini/analyze` - Gemini image analysis
- `POST /api/perplexity/analyze` - Perplexity documents
- `POST /api/claude/analyze` - Claude image analysis

**Messaging Endpoints:**
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages
- `DELETE /api/messages/:id` - Delete message

**LMS Endpoints:**
- `GET /api/lms/lessons` - Get lessons
- `GET /api/lms/quizzes` - Get quizzes
- `GET /api/lms/assignments` - Get assignments

**Mentor/Parent Endpoints:**
- `GET /api/mentor/students` - Get mentor's students
- `GET /api/parent/children` - Get parent's children

---

## Database Connection

### Supabase Client

**Initialization:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);
```

### Querying Data

**Select:**
```typescript
const { data } = await supabase
  .from('lessons')
  .select('*')
  .eq('teacher_id', userId);
```

**Insert:**
```typescript
const { data, error } = await supabase
  .from('lessons')
  .insert([{ title: 'Lesson 1', teacher_id: userId }]);
```

**Update:**
```typescript
const { data, error } = await supabase
  .from('lessons')
  .update({ title: 'Updated Title' })
  .eq('id', lessonId);
```

**Delete:**
```typescript
const { error } = await supabase
  .from('lessons')
  .delete()
  .eq('id', lessonId);
```

### Real-Time Subscriptions

```typescript
const subscription = supabase
  .from('messages')
  .on('INSERT', payload => {
    console.log('New message:', payload.new);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## UI Framework

### Material-UI (MUI)

**Components Used:**
- Box, Container, Grid - Layout
- Button, IconButton - Buttons
- TextField, Select - Forms
- Card, Paper - Containers
- Table - Data display
- Dialog, Modal - Overlays
- Drawer - Sidebar
- AppBar - Header
- Toolbar - Toolbar
- Menu, MenuItem - Menus
- Chip, Badge - Indicators
- Progress, Skeleton - Loading
- Alert, Snackbar - Notifications

**Theming:**
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: { default: '#f5f7fa' },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});
```

### Tailwind CSS

**Utility Classes:**
- Spacing: `p-4`, `m-2`, `gap-3`
- Colors: `bg-blue-500`, `text-red-600`
- Sizing: `w-full`, `h-screen`
- Flexbox: `flex`, `justify-center`, `items-center`
- Grid: `grid`, `grid-cols-3`
- Responsive: `md:w-1/2`, `lg:flex`

### shadcn-ui

**Pre-built Components:**
- Toaster - Toast notifications
- Tooltip - Tooltips
- Dialog - Dialogs
- Dropdown Menu - Menus
- And more...

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:8080
```

### File Organization

**When adding a new feature:**

1. **Create page component** in `src/pages/`
2. **Create components** in `src/components/`
3. **Create hooks** in `src/hooks/` if needed
4. **Add route** in `src/App.tsx`
5. **Add types** in `src/types/`
6. **Add context** in `src/contexts/` if needed

### Best Practices

**Component Structure:**
```typescript
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface MyComponentProps {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
  const { user } = useAuth();
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div>
      <h1>{title}</h1>
      {/* Component content */}
    </div>
  );
};
```

**Error Handling:**
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  setData(data);
} catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

**Loading States:**
```typescript
if (loading) return <Skeleton />;
if (error) return <Alert severity="error">{error}</Alert>;
return <Content data={data} />;
```

---

## Summary

**Frontend Architecture Overview:**

1. **Entry Point** - `main.tsx` loads `App.tsx`
2. **Providers** - Query, Theme, Auth, Config providers wrap app
3. **Router** - React Router handles navigation
4. **Authentication** - AuthContext manages user state
5. **Layout** - MainLayout wraps authenticated pages
6. **Components** - Reusable UI components
7. **Pages** - Role-specific page components
8. **Hooks** - Custom hooks for logic
9. **API** - Fetch calls to backend
10. **Database** - Supabase client for data
11. **UI** - Material-UI + Tailwind CSS
12. **State** - Context API + React Query

**Key Files:**
- `src/App.tsx` - Routing and providers
- `src/contexts/AuthContext.tsx` - Authentication
- `src/lib/supabase.ts` - Database connection
- `src/components/Layout/MainLayout.tsx` - Page layout
- `src/pages/` - Page components

**Development Flow:**
1. User logs in → AuthContext authenticates
2. Session persisted in localStorage
3. User navigated to dashboard
4. MainLayout wraps page with TopBar + Sidebar
5. Page component renders role-specific content
6. Components fetch data from Supabase
7. Real-time subscriptions update UI
8. User interacts with components
9. API calls to backend for complex operations

---

**Last Updated:** January 2026
**Version:** 2.0
