# Voice Learn Suite - Complete Documentation

A comprehensive Learning Management System (LMS) with integrated AI tutoring, voice navigation, and multi-role support.

---

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (free tier works)
- API keys for AI providers (Groq, Gemini, Perplexity)

### Setup

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Configure environment variables
# Create .env in root and backend/.env

# 3. Start services (3 terminals)
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# 3. Open browser
# http://localhost:8080
```

### Environment Variables

**Root .env:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**backend/.env:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

---

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Supabase Client (database & auth)

### Backend
- Node.js + Express
- Supabase (PostgreSQL + RLS)
- JWT Authentication

### AI & Voice
- **Groq** - Fast text analysis (default, free)
- **Google Gemini** - Image/document analysis (free, 60 req/min)
- **Perplexity** - Advanced document understanding (free tier)
- **Claude** - Premium image analysis (optional)
- **Web Speech API** - Browser-native voice
- **Whisper** - Speech-to-text transcription

---

## Architecture

### Connection Flow

```
Frontend (localhost:8080)
    ↓
Vite Proxy (/api → localhost:3001)
    ↓
Backend Express Server (localhost:3001)
    ↓
Supabase Database
```

### Key Files

**Frontend:**
- `src/lib/supabase.ts` - Database connection
- `src/contexts/AuthContext.tsx` - Authentication & role loading
- `src/contexts/ThemeContext.tsx` - Dark/light mode
- `src/components/AITutor/AITutorNew.tsx` - AI chat interface
- `vite.config.ts` - Proxy configuration

**Backend:**
- `backend/server.js` - Express server setup
- `backend/*-routes.js` - API endpoints
- `backend/groq-ai-routes.js` - Groq integration
- `backend/gemini-ai-routes.js` - Gemini integration

**Database:**
- `database/*.sql` - Schema and migrations
- `database/FIX_RLS_POLICIES.sql` - Security policies

---

## User Roles & Access

### 6 Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | System-wide control, manage organizations |
| **Admin** | Domain management, user management, analytics |
| **Teacher** | Create content, manage classes, view analytics |
| **Student** | Learn, take quizzes, submit assignments, chat with AI |
| **Mentor** | Guide students, track progress, communicate |
| **Parent** | Track child progress, communicate with mentors |

### How Role Access Works

1. **Login** → User enters credentials
2. **Auth** → Supabase verifies email/password
3. **Load Profile** → Query `profiles` table, get `role` column
4. **Set Context** → Store role in Auth context via `useAuth()`
5. **Route** → Navigate to role-specific dashboard
6. **Query Data** → Fetch only user's data
7. **RLS Enforces** → Database blocks unauthorized access

**Example:**
```typescript
const { user } = useAuth();
if (user?.role === 'student') {
  return <StudentDashboard />;
}
```

---

## AI Integration

### How AI Tutor Works

```
User Types Question
    ↓
Frontend calls /api/groq/chat
    ↓
Backend routes to Groq API
    ↓
AI generates response
    ↓
Response stored in ai_tutor_sessions table
    ↓
Frontend displays + optional voice output
```

### AI Providers

**Groq** (Default)
- Fastest, free, unlimited
- Best for: Text analysis, Q&A
- Model: `llama-3.1-8b-instant`

**Gemini**
- Free tier: 60 requests/minute
- Best for: Image/document analysis
- Get key: https://makersuite.google.com/app/apikey

**Perplexity**
- Free tier available
- Best for: Complex documents
- Get key: https://www.perplexity.ai/

**Claude** (Optional)
- Premium, most capable
- Best for: Complex reasoning
- Get key: https://console.anthropic.com/

### Using AI in Components

```typescript
const response = await fetch('/api/groq/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userQuestion,
    model: 'llama-3.1-8b-instant'
  })
});

const data = await response.json();
console.log(data.response);
```

---

## Voice Features

### Voice Input
```typescript
import { useVoiceContent } from '@/hooks/useVoiceContent';

const { startListening, stopListening, transcript } = useVoiceContent();

<button onClick={startListening}>Start</button>
<button onClick={stopListening}>Stop</button>
<p>You said: {transcript}</p>
```

### Text-to-Speech
```typescript
const utterance = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(utterance);
```

### Voice Commands
```typescript
import { useEnhancedVoiceNavigation } from '@/hooks/useEnhancedVoiceNavigation';

// Supports: "Go to dashboard", "Open messages", "Start quiz", etc.
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User info, roles, permissions |
| `lessons` | Video lessons |
| `quizzes` | Quiz content |
| `quiz_results` | Student quiz submissions |
| `assignments` | Assignment content |
| `messages` | User-to-user messaging |
| `announcements` | System announcements |
| `ai_tutor_sessions` | AI chat history |
| `mentor_student_links` | Mentor-student relationships |
| `parent_child_links` | Parent-child relationships |

### Row-Level Security (RLS)

Database-level security that restricts data access:
- Students see only their data
- Teachers see their class data
- Mentors see their mentee data
- Admins see organization data

---

## API Endpoints

### AI Tutor
- `POST /api/ai-tutor/analyze` - Text analysis
- `POST /api/ai-tutor/sessions` - Session management
- `GET /api/ai-tutor/sessions/:id` - Get history

### AI Providers
- `POST /api/groq/chat` - Groq text analysis
- `POST /api/gemini/analyze` - Gemini image analysis
- `POST /api/perplexity/analyze` - Perplexity documents
- `POST /api/claude/analyze` - Claude image analysis

### Core Features
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages
- `DELETE /api/messages/:id` - Delete message
- `GET /api/mentor/students` - Get mentor's students
- `GET /api/parent/children` - Get parent's children

---

## Commands Reference

### Development
```bash
npm run dev              # Start frontend dev server
cd backend && npm run dev # Start backend dev server
npm run build            # Build for production
npm install              # Install dependencies
```

### Database
```bash
node check-lms-tables.js           # Check tables exist
node check-subdomain-columns.js    # Check columns
node view-database.js              # View database
node backend/apply-migration.js    # Apply migrations
```

### Testing
```bash
node test-ollama-connection.js     # Test Ollama
curl http://localhost:3001/api/health  # Test backend
curl http://localhost:11434/api/tags   # Test Ollama
```

### Troubleshooting
```bash
# Kill backend (if stuck)
taskkill /IM node.exe /F

# Check port usage
netstat -ano | findstr :3001

# Restart services
npm run dev
```

---

## Project Structure

```
voice-learn-suite/
├── src/
│   ├── components/
│   │   ├── AITutor/          # AI chat components
│   │   ├── Layout/           # Main layout
│   │   └── [other]
│   ├── pages/
│   │   ├── Student/          # Student pages
│   │   ├── Teacher/          # Teacher pages
│   │   ├── Mentor/           # Mentor pages
│   │   ├── Parent/           # Parent pages
│   │   ├── Admin/            # Admin pages
│   │   └── [other]
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # Auth, Theme contexts
│   ├── lib/                  # Utilities, Supabase client
│   └── App.tsx               # Main app component
├── backend/
│   ├── server.js             # Express server
│   ├── *-routes.js           # API routes
│   └── [other]
├── database/
│   ├── *.sql                 # Schema migrations
│   └── [other]
├── docs_archive/             # Archived docs
├── vite.config.ts            # Vite config
├── package.json              # Dependencies
└── [config files]
```

---

## Common Tasks

### Add a New API Endpoint

1. Create route file: `backend/my-feature-routes.js`
```javascript
export function initializeMyFeatureRoutes(app) {
  app.post('/api/my-feature/action', async (req, res) => {
    try {
      const { data } = req.body;
      res.json({ success: true, result: data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
```

2. Mount in `backend/server.js`:
```javascript
import { initializeMyFeatureRoutes } from './my-feature-routes.js';
initializeMyFeatureRoutes(app);
```

3. Call from frontend:
```typescript
const response = await fetch('/api/my-feature/action', {
  method: 'POST',
  body: JSON.stringify({ data: myData })
});
```

### Query Database

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

### Check User Role

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
if (user?.role === 'teacher') {
  // Show teacher features
}
```

### Add Voice Input

```typescript
import { useVoiceContent } from '@/hooks/useVoiceContent';

const { startListening, transcript } = useVoiceContent();
```

---

## Troubleshooting

### Frontend can't reach backend
```bash
# Check backend is running on port 3001
curl http://localhost:3001/api/health

# Check Vite proxy in vite.config.ts
# Restart both services
```

### Database connection fails
```bash
# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Check Supabase project is active
# Verify credentials are correct
```

### AI Tutor not responding
```bash
# Check API key in backend/.env
# Verify API key is valid
# Check rate limits (Gemini: 60 req/min)
# Try different AI provider
```

### Voice input not working
```bash
# Check browser supports Web Speech API (Chrome, Edge)
# Check microphone permissions
# Check browser console for errors
# Try different browser
```

### Port already in use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

---

## Deployment

### Frontend
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or any static host
- Update API URLs in environment variables

### Backend
- Deploy to: Heroku, Railway, VPS, or any Node.js host
- Set environment variables on hosting platform
- Ensure database is accessible

### Database
- Use Supabase (managed PostgreSQL)
- Enable RLS policies
- Set up backups

---

## Security

- JWT-based authentication
- Row-Level Security (RLS) on all tables
- API keys in environment variables only
- Service role key for admin operations only
- User data isolated by organization/subdomain

---

## Performance Tips

- Groq is fastest for text (use as default)
- Gemini has rate limits (60 req/min free)
- Optimize database queries with indexes
- Use real-time subscriptions for live updates
- Cache frequently accessed data

---

## Getting Help

- Check `docs_archive/` for detailed guides
- Review code comments in components
- Check browser console for errors
- Test API endpoints with curl
- Verify environment variables are set

---

## File Organization

**Keep in root:**
- `README.md` - This file
- `SETUP_GUIDE.md` - Detailed setup instructions
- `API_REFERENCE.md` - Complete API documentation

**Archive in docs_archive/:**
- All other .md files (for reference)

---

**Last Updated:** January 2026
**Version:** 2.0
