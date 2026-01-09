# Voice Learn Suite - Q&A Documentation

Comprehensive Q&A covering code, implementation, architecture, and features.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Setup](#architecture--setup)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [Database & Data](#database--data)
6. [AI Integration](#ai-integration)
7. [Voice Features](#voice-features)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Messaging System](#messaging-system)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Q: What is Voice Learn Suite?
**A:** Voice Learn Suite is a comprehensive Learning Management System (LMS) with integrated AI tutoring, voice navigation, and multi-role support. It allows students to learn with AI assistance, teachers to manage content, mentors to guide students, and parents to track progress.

### Q: What are the main features?
**A:**
- AI-powered tutoring (text-based Q&A)
- Voice-based navigation and commands
- Video lessons and live classes
- Quizzes and assignments with rankings
- Messaging system (user-to-user, mentor-parent)
- Community discussions
- Real-time progress tracking
- Multi-role support (student, teacher, mentor, parent, admin)
- Dark/light mode
- Announcements system

### Q: What technology stack is used?
**A:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **AI:** Groq, Google Gemini, Perplexity, Claude
- **Voice:** Web Speech API, Whisper
- **Authentication:** JWT via Supabase

### Q: How many user roles are there?
**A:** 6 roles:
1. **Super Admin** - System-wide control
2. **Admin** - Domain/organization management
3. **Teacher** - Content creation and management
4. **Student** - Learning and participation
5. **Mentor** - Student guidance and support
6. **Parent** - Child progress tracking

### Q: What is the project structure?
**A:**
```
voice-learn-suite/
├── src/                    # Frontend React code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts (Auth, Theme)
│   └── lib/               # Utilities and Supabase client
├── backend/               # Express server
│   ├── *-routes.js        # API route handlers
│   └── server.js          # Main server file
├── database/              # SQL migration files
├── docs_archive/          # Archived documentation
└── [config files]         # vite.config.ts, package.json, etc.
```

---

## Architecture & Setup

### Q: How do frontend and backend communicate?
**A:** Through HTTP REST API:
1. Frontend runs on `http://localhost:8080`
2. Vite proxy (in `vite.config.ts`) routes `/api/*` to `http://localhost:3001`
3. Backend Express server listens on port 3001
4. Frontend makes fetch calls to `/api/endpoint`
5. Vite proxy intercepts and forwards to backend

### Q: Where is the Vite proxy configured?
**A:** In `vite.config.ts`:
```typescript
server: {
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### Q: How does the backend connect to the database?
**A:** Through Supabase client in `backend/server.js`:
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```
Uses service role key for admin access to all tables.

### Q: How does the frontend connect to the database?
**A:** Through Supabase client in `src/lib/supabase.ts`:
```typescript
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```
Uses anon key with Row-Level Security (RLS) policies for user-specific access.

### Q: What environment variables are needed?
**A:**
**Frontend (.env):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend (backend/.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

### Q: How do I start the development environment?
**A:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```
Frontend will be at `http://localhost:8080`
Backend will be at `http://localhost:3001`

### Q: What ports are used?
**A:**
- Frontend: 8080
- Backend: 3001
- Ollama (if used): 11434

---

## Frontend Implementation

### Q: Where is the main App component?
**A:** `src/App.tsx` - Sets up routing, authentication context, and theme context.

### Q: How is authentication handled?
**A:** Through `src/contexts/AuthContext.tsx`:
- Uses Supabase authentication
- Stores user session in localStorage
- Provides `useAuth()` hook for components
- Handles login, logout, and session persistence

### Q: How do I use the Auth context in a component?
**A:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

export const MyComponent = () => {
  const { user, loading, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome {user.email}</div>;
};
```

### Q: How is dark mode implemented?
**A:** Through `src/contexts/ThemeContext.tsx`:
- Stores theme preference in localStorage
- Provides `useTheme()` hook
- Applies `dark` class to document root
- Tailwind CSS handles dark mode styles

### Q: How do I toggle dark mode?
**A:**
```typescript
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
};
```

### Q: Where is the main layout?
**A:** `src/components/Layout/MainLayout.tsx` - Wraps all pages with:
- Sidebar navigation
- Top bar with user info
- Notification panel
- Main content area

### Q: How is routing set up?
**A:** In `src/App.tsx` using React Router:
- Different routes for different user roles
- Protected routes check user authentication
- Role-based route access

### Q: Where are the page components?
**A:** In `src/pages/`:
- `Student/StudentDashboard.tsx` - Student home
- `Teacher/TeacherDashboard.tsx` - Teacher home
- `Mentor/MentorDashboard.tsx` - Mentor home
- `Parent/ParentDashboard.tsx` - Parent home
- `Admin/AdminDashboard.tsx` - Admin panel
- And many feature-specific pages

### Q: How do I make an API call from a component?
**A:**
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: myData })
});

const result = await response.json();
```

### Q: How do I query the database directly?
**A:**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

### Q: What custom hooks are available?
**A:**
- `useAuth()` - Authentication
- `useTheme()` - Dark/light mode
- `useVoiceContent()` - Voice input/output
- `useWhisperVoiceNavigation()` - Whisper integration
- `useEnhancedVoiceNavigation()` - Advanced voice
- `useDocumentReader()` - Document reading
- `useAITutorAnalysis()` - AI tutor logic

### Q: How do I use the AI Tutor component?
**A:**
```typescript
import { AITutorNew } from '@/components/AITutor/AITutorNew';

export const MyPage = () => {
  return (
    <div>
      <h1>My Page</h1>
      <AITutorNew />
    </div>
  );
};
```

---

## Backend Implementation

### Q: Where is the main backend server?
**A:** `backend/server.js` - Sets up Express app, CORS, routes, and starts listening on port 3001.

### Q: How are routes organized?
**A:** Each feature has its own route file:
- `lms-routes.js` - Lessons, quizzes, assignments
- `messaging-routes.js` - User messaging
- `mentor-routes.js` - Mentor features
- `teacher-routes.js` - Teacher features
- `announcements-routes.js` - Announcements
- `groq-ai-routes.js` - Groq AI integration
- `gemini-ai-routes.js` - Gemini integration
- `perplexity-ai-routes.js` - Perplexity integration

### Q: How do I create a new route?
**A:**
```javascript
// backend/my-feature-routes.js
export function initializeMyFeatureRoutes(app) {
  app.post('/api/my-feature/action', async (req, res) => {
    try {
      const { data } = req.body;
      // Process data
      res.json({ success: true, result: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// In backend/server.js
import { initializeMyFeatureRoutes } from './my-feature-routes.js';
initializeMyFeatureRoutes(app);
```

### Q: How do I access the database in a route?
**A:** The Supabase client is passed to route initializers:
```javascript
export function initializeMyRoutes(supabase) {
  app.get('/api/my-endpoint', async (req, res) => {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
    
    if (error) return res.status(500).json({ error });
    res.json(data);
  });
}
```

### Q: How do I handle authentication in routes?
**A:** Extract user from JWT token:
```javascript
const authHeader = req.headers.authorization;
const token = authHeader?.split(' ')[1];
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Q: What is CORS and why is it needed?
**A:** CORS (Cross-Origin Resource Sharing) allows frontend on different domain/port to access backend.
```javascript
app.use(cors()); // In backend/server.js
```
Without it, browser blocks requests from `localhost:8080` to `localhost:3001`.

### Q: How do I handle file uploads?
**A:** Using multer middleware:
```javascript
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  // Process file
});
```

### Q: How do I call an external API (like Groq)?
**A:**
```javascript
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  model: 'mixtral-8x7b-32768',
  messages: [{ role: 'user', content: userMessage }],
});
```

---

## Database & Data

### Q: What database is used?
**A:** Supabase (PostgreSQL) - Provides:
- PostgreSQL database
- Real-time subscriptions
- Authentication
- Row-Level Security (RLS)
- File storage

### Q: What are the main tables?
**A:**
- `profiles` - User information and roles
- `lessons` - Video lessons
- `quizzes` - Quiz content
- `quiz_questions` - Quiz questions
- `quiz_results` - Student quiz submissions
- `assignments` - Assignment content
- `messages` - User-to-user messages
- `announcements` - System announcements
- `ai_tutor_sessions` - AI chat history
- `mentor_student_links` - Mentor-student relationships
- `parent_child_links` - Parent-child relationships

### Q: What is Row-Level Security (RLS)?
**A:** Database-level security that restricts data access based on user:
- Students can only see their own data
- Teachers can see their class data
- Mentors can see their mentee data
- Admins can see organization data
- Policies defined in SQL files

### Q: How do I check RLS policies?
**A:** Look in database SQL files:
- `FIX_RLS_POLICIES.sql` - Main RLS setup
- `30_fix_rls_for_admin_deletes.sql` - Admin access
- `31_disable_rls_admin_tables.sql` - Admin table access

### Q: How do I run database migrations?
**A:**
```bash
# In Supabase dashboard, go to SQL Editor
# Copy content from database/*.sql files
# Run the SQL

# Or use migration scripts
node backend/apply-migration.js
```

### Q: What is a subdomain?
**A:** Multi-tenancy feature allowing multiple organizations:
- Each organization has its own subdomain
- Data isolated by subdomain
- Admins manage their subdomain only
- Set up in `database/03_domains_schema.sql`

### Q: How do I add a new table?
**A:**
1. Create SQL file in `database/` folder
2. Define table schema with proper columns
3. Add RLS policies if needed
4. Run SQL in Supabase dashboard
5. Update TypeScript types in `src/lib/supabase.ts`

### Q: How do I query related data?
**A:**
```typescript
const { data } = await supabase
  .from('students')
  .select(`
    id,
    name,
    quizzes (
      id,
      title,
      score
    )
  `)
  .eq('id', studentId);
```

### Q: How do I handle transactions?
**A:** Supabase doesn't support transactions directly, but you can:
```javascript
// Use RPC functions for multi-step operations
const { data, error } = await supabase.rpc('my_function', {
  param1: value1,
  param2: value2
});
```

---

## AI Integration

### Q: How many AI providers are integrated?
**A:** 4 providers:
1. **Groq** - Fast text analysis (default, free, unlimited)
2. **Google Gemini** - Image/document analysis (free, 60 req/min)
3. **Perplexity** - Advanced document understanding (free tier)
4. **Claude** - Premium image analysis (optional, paid)

### Q: Which AI provider is used by default?
**A:** Groq - It's the fastest and free with unlimited requests.

### Q: How do I switch AI providers?
**A:** In `src/components/AITutor/AITutorNew.tsx`:
```typescript
let endpoint = '/api/groq/chat'; // Change to /api/gemini/analyze, etc.
```

### Q: How does the AI Tutor work?
**A:**
1. User types question in `AITutorNew.tsx`
2. Frontend sends to `/api/groq/chat`
3. Backend calls Groq API
4. Response returned to frontend
5. Optional text-to-speech plays response
6. Conversation saved to `ai_tutor_sessions` table

### Q: Where is the AI Tutor component?
**A:** `src/components/AITutor/AITutorNew.tsx` - Main text-based chat interface.

### Q: How do I add image analysis?
**A:** Use Gemini endpoint:
```typescript
const response = await fetch('/api/gemini/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: base64Image,
    prompt: userQuestion
  })
});
```

### Q: How do I get Groq API key?
**A:**
1. Go to https://console.groq.com
2. Sign up for free account
3. Create API key
4. Add to `backend/.env`: `GROQ_API_KEY=your_key`

### Q: How do I get Gemini API key?
**A:**
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `backend/.env`: `GEMINI_API_KEY=your_key`

### Q: How do I get Perplexity API key?
**A:**
1. Go to https://www.perplexity.ai/
2. Sign up and get API key
3. Add to `backend/.env`: `PERPLEXITY_API_KEY=your_key`

### Q: What is the AI response format?
**A:**
```json
{
  "response": "The AI's answer to the question",
  "model": "mixtral-8x7b-32768",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50
  }
}
```

### Q: How do I save AI conversations?
**A:** Automatically saved to `ai_tutor_sessions` table:
```typescript
await fetch(`/api/ai-tutor/sessions/${sessionId}/messages`, {
  method: 'POST',
  body: JSON.stringify({
    role: 'user',
    content: message
  })
});
```

### Q: Can I use multiple AI providers in one request?
**A:** Not directly, but you can:
1. Try Groq first (fastest)
2. Fall back to Gemini if needed
3. Use Perplexity for complex documents

---

## Voice Features

### Q: How does voice input work?
**A:** Using Web Speech API (browser-native):
1. User clicks microphone button
2. Browser captures audio
3. Speech-to-text converts to text
4. Text sent to AI or used as command

### Q: Where is voice input implemented?
**A:** `src/hooks/useWhisperVoiceNavigation.ts` and `src/hooks/useVoiceContent.ts`

### Q: How do I enable voice input in a component?
**A:**
```typescript
import { useVoiceContent } from '@/hooks/useVoiceContent';

export const MyComponent = () => {
  const { startListening, stopListening, transcript } = useVoiceContent();
  
  return (
    <div>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <p>You said: {transcript}</p>
    </div>
  );
};
```

### Q: How does text-to-speech work?
**A:** Using browser's Web Speech API:
```typescript
const utterance = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(utterance);
```

### Q: Where is text-to-speech implemented?
**A:** In `src/components/AITutor/AITutorNew.tsx` - Optional auto-speech toggle.

### Q: What is Whisper?
**A:** OpenAI's speech-to-text model for more accurate transcription.
- Implemented in `backend/whisper-voice-server.js`
- More accurate than Web Speech API
- Requires audio file upload

### Q: How do I use Whisper?
**A:**
```typescript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('/api/whisper/transcribe', {
  method: 'POST',
  body: formData
});

const { text } = await response.json();
```

### Q: Can I use voice commands?
**A:** Yes, through `useEnhancedVoiceNavigation.ts`:
- "Go to dashboard"
- "Open messages"
- "Start quiz"
- Custom commands can be added

### Q: How do I add a new voice command?
**A:** In `src/hooks/useEnhancedVoiceNavigation.ts`:
```typescript
const commands = {
  'my command': () => {
    // Execute action
  }
};
```

---

## User Roles & Permissions

### Q: What can each role do?

**A:**

**Student:**
- View lessons and videos
- Take quizzes and assignments
- Chat with AI tutor
- Message mentors
- View rankings
- See announcements

**Teacher:**
- Create lessons and videos
- Create quizzes and assignments
- View student performance
- Manage class
- Send announcements
- View analytics

**Mentor:**
- View assigned students
- Message students and parents
- Track student progress
- Provide guidance
- View analytics

**Parent:**
- View child's progress
- Message mentors
- View announcements
- Track performance

**Admin:**
- Manage users
- Configure system
- Manage domains/subdomains
- View analytics
- Manage announcements

**Super Admin:**
- All admin permissions
- Manage multiple organizations
- System-wide configuration

### Q: How are permissions enforced?
**A:** Through:
1. **Frontend:** Role-based route protection
2. **Backend:** Route-level checks
3. **Database:** Row-Level Security (RLS) policies

### Q: How do I check user role?
**A:**
```typescript
const { user } = useAuth();
if (user?.role === 'teacher') {
  // Show teacher features
}
```

### Q: How do I protect a route?
**A:**
```typescript
// In App.tsx
<Route
  path="/teacher/dashboard"
  element={
    <ProtectedRoute requiredRole="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  }
/>
```

### Q: How do I add a new role?
**A:**
1. Update `UserRole` type in `src/lib/supabase.ts`
2. Add role to database `profiles` table
3. Create RLS policies for new role
4. Add routes and components for new role
5. Update role checks in components

### Q: How do I assign a role to a user?
**A:**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ role: 'teacher' })
  .eq('id', userId);
```

---

## Messaging System

### Q: How does user-to-user messaging work?
**A:**
1. User sends message via `Messages.tsx`
2. Message saved to `messages` table
3. Real-time subscription notifies recipient
4. Recipient sees message in UI

### Q: Where is messaging implemented?
**A:**
- Frontend: `src/pages/Messages.tsx`
- Backend: `backend/messaging-routes.js`
- Database: `messages` table

### Q: How do I send a message?
**A:**
```typescript
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient_id: recipientId,
    content: messageText
  })
});
```

### Q: How do I get messages?
**A:**
```typescript
const { data } = await supabase
  .from('messages')
  .select('*')
  .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

### Q: How do I delete a message?
**A:**
```typescript
const { error } = await supabase
  .from('messages')
  .update({ deleted_at: new Date() })
  .eq('id', messageId);
```

### Q: How does mentor-parent messaging work?
**A:**
- Separate from user-to-user messaging
- Implemented in `backend/mentor-parent-messaging.js`
- Uses `mentor_parent_messages` table
- Real-time updates

### Q: How do I get mentor-parent messages?
**A:**
```typescript
const response = await fetch('/api/mentor-parent/messages', {
  method: 'GET'
});
const messages = await response.json();
```

### Q: Can I send attachments?
**A:** Currently text-only, but can be extended:
```typescript
// Future: Add file upload support
const formData = new FormData();
formData.append('file', file);
formData.append('recipient_id', recipientId);

await fetch('/api/messages/upload', {
  method: 'POST',
  body: formData
});
```

---

## Troubleshooting

### Q: Frontend can't connect to backend
**A:**
1. Check backend is running: `npm run dev` in `backend/` folder
2. Check port 3001 is available
3. Verify Vite proxy in `vite.config.ts`
4. Check CORS is enabled in `backend/server.js`
5. Test: `curl http://localhost:3001/api/health`

### Q: Database connection fails
**A:**
1. Check environment variables in `.env`
2. Verify Supabase URL and keys are correct
3. Check internet connection
4. Verify Supabase project is active
5. Check RLS policies aren't blocking access

### Q: AI Tutor not responding
**A:**
1. Check API key in `backend/.env`
2. Verify API key is valid
3. Check rate limits (Gemini: 60 req/min)
4. Check backend logs for errors
5. Try different AI provider

### Q: Voice input not working
**A:**
1. Check browser supports Web Speech API (Chrome, Edge)
2. Check microphone permissions
3. Check browser console for errors
4. Verify `useVoiceContent` hook is initialized
5. Try different browser

### Q: Messages not appearing
**A:**
1. Check `messages` table exists
2. Verify RLS policies allow access
3. Check real-time subscriptions are active
4. Verify user IDs are correct
5. Check database for message records

### Q: Dark mode not working
**A:**
1. Check `ThemeContext` is initialized
2. Verify `useTheme()` hook is used
3. Check Tailwind dark mode is enabled
4. Check localStorage for theme preference
5. Clear browser cache

### Q: User can't log in
**A:**
1. Check Supabase auth is configured
2. Verify user exists in `profiles` table
3. Check password is correct
4. Verify email is confirmed
5. Check RLS policies on `profiles` table

### Q: Ranking not updating
**A:**
1. Check quiz results are saved
2. Verify ranking calculation logic
3. Check `recalculateRankings()` is called
4. Verify user scores are correct
5. Check database for ranking records

### Q: Video not playing
**A:**
1. Check video URL is valid
2. Verify video format is supported
3. Check CORS headers on video server
4. Verify video file exists
5. Check browser console for errors

### Q: Assignment submission fails
**A:**
1. Check file size limit (50MB)
2. Verify file format is allowed
3. Check storage bucket permissions
4. Verify user has permission to submit
5. Check database for submission records

### Q: Announcement not showing
**A:**
1. Check announcement is published
2. Verify user role has access
3. Check RLS policies
4. Verify announcement date is current
5. Check database for announcement records

### Q: Performance is slow
**A:**
1. Check database query performance
2. Verify indexes are created
3. Check for N+1 queries
4. Optimize component re-renders
5. Check network tab for slow requests

### Q: Build fails
**A:**
1. Check TypeScript errors: `npm run build`
2. Verify all imports are correct
3. Check for missing dependencies
4. Clear node_modules and reinstall
5. Check Node.js version compatibility

### Q: Port already in use
**A:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Q: CORS error
**A:**
1. Verify CORS is enabled in backend
2. Check frontend URL is allowed
3. Verify credentials are included
4. Check request headers
5. Test with curl: `curl -H "Origin: http://localhost:8080" http://localhost:3001/api/test`

### Q: Session expires too quickly
**A:**
1. Check token expiration in Supabase
2. Verify auto-refresh is enabled
3. Check localStorage for session
4. Verify `persistSession: true` in Supabase client
5. Increase token expiration time

### Q: Real-time updates not working
**A:**
1. Check real-time is enabled in Supabase
2. Verify subscription is active
3. Check for JavaScript errors
4. Verify table has real-time enabled
5. Check network tab for WebSocket connection

---

## Additional Resources

- **TECH_OVERVIEW.md** - Technology stack and architecture
- **BACKEND_FRONTEND_CONNECTION.md** - Connection details
- **COMMANDS_REFERENCE.md** - All available commands
- **docs_archive/** - Archived documentation

---

## Quick Reference

| Topic | File | Key Function |
|-------|------|--------------|
| Auth | `src/contexts/AuthContext.tsx` | `useAuth()` |
| Theme | `src/contexts/ThemeContext.tsx` | `useTheme()` |
| Database | `src/lib/supabase.ts` | `supabase` client |
| Backend | `backend/server.js` | Express app |
| AI Tutor | `src/components/AITutor/AITutorNew.tsx` | Chat interface |
| Voice | `src/hooks/useVoiceContent.ts` | Voice input/output |
| Messaging | `src/pages/Messages.tsx` | User messaging |
| Routing | `src/App.tsx` | Route definitions |

---

**Last Updated:** December 2025
**Version:** 1.0
