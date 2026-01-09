# Backend-Frontend Connection Guide

Complete guide on how frontend connects to backend and where to configure it.

---

## Connection Architecture

```
Frontend (React/Vite)
    ↓
Vite Proxy (localhost:8080 → localhost:3001)
    ↓
Backend Express Server (localhost:3001)
    ↓
Supabase Database
```

---

## Key Connection Files

### 1. Frontend Configuration: `vite.config.ts`

**Location:** Root directory

**Purpose:** Configures Vite dev server and API proxy

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // ← Backend URL
        changeOrigin: true,
      },
    },
  },
  // ... other config
}));
```

**What it does:**
- Frontend runs on `http://localhost:8080`
- Any request to `/api/*` is proxied to `http://localhost:3001`
- This allows frontend to call `/api/groq/chat` which actually goes to backend

---

### 2. Database Connection: `src/lib/supabase.ts`

**Location:** `src/lib/supabase.ts`

**Purpose:** Initializes Supabase client for direct database access

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
```

**What it does:**
- Connects frontend directly to Supabase database
- Uses environment variables from `.env`
- Handles authentication and session management

**Environment variables needed:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

### 3. Backend Server: `backend/server.js`

**Location:** `backend/server.js`

**Purpose:** Main Express server that handles all API routes

```javascript
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mount all route handlers
initializeLMSRoutes(supabase);
initializeMentorParentMessaging(supabase);
initializeMessagingRoutes(supabase);
initializeGroqRoutes(app);
initializeGeminiRoutes(app);
initializePerplexityRoutes(app);

// Start server on port 3001
app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
```

**What it does:**
- Runs on port 3001
- Handles all `/api/*` requests from frontend
- Connects to Supabase with service role key (admin access)
- Mounts all route handlers

**Environment variables needed:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

---

## How Frontend Makes API Calls

### Example 1: AI Tutor Chat

**File:** `src/components/AITutor/AITutorNew.tsx`

```typescript
const sendMessage = async () => {
  const response = await fetch('/api/groq/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      model: 'llama-3.1-8b-instant'
    })
  });
  
  const data = await response.json();
  // Display response
};
```

**Flow:**
1. Frontend calls `/api/groq/chat`
2. Vite proxy intercepts and sends to `http://localhost:3001/api/groq/chat`
3. Backend route handler processes request
4. Response sent back to frontend

---

### Example 2: Direct Database Query

**File:** Any component using Supabase

```typescript
import { supabase } from '@/lib/supabase';

const fetchMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId);
  
  return data;
};
```

**Flow:**
1. Frontend calls Supabase client directly
2. Supabase client connects to database
3. Row-level security (RLS) policies enforce permissions
4. Data returned to frontend

---

## Backend Route Files

### AI Routes
| File | Endpoint | Purpose |
|------|----------|---------|
| `backend/groq-ai-routes.js` | `/api/groq/*` | Groq text analysis |
| `backend/gemini-ai-routes.js` | `/api/gemini/*` | Gemini image analysis |
| `backend/perplexity-ai-routes.js` | `/api/perplexity/*` | Perplexity document analysis |
| `backend/ai-tutor-routes.js` | `/api/ai-tutor/*` | Main AI tutor endpoint |
| `backend/ai-tutor-sessions-routes.js` | `/api/ai-tutor/sessions/*` | Session management |

### Core Routes
| File | Endpoint | Purpose |
|------|----------|---------|
| `backend/lms-routes.js` | `/api/lms/*` | Lessons, quizzes, assignments |
| `backend/messaging-routes.js` | `/api/messages/*` | User messaging |
| `backend/mentor-routes.js` | `/api/mentor/*` | Mentor features |
| `backend/teacher-routes.js` | `/api/teacher/*` | Teacher features |
| `backend/announcements-routes.js` | `/api/announcements/*` | Announcements |
| `backend/mentor-parent-messaging.js` | `/api/mentor-parent/*` | Mentor-parent chat |

---

## Environment Configuration

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend (backend/.env)
```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
```

---

## Connection Flow Diagram

### Text-Based AI Chat
```
User Types Message
    ↓
AITutorNew.tsx calls fetch('/api/groq/chat')
    ↓
Vite proxy routes to http://localhost:3001/api/groq/chat
    ↓
backend/groq-ai-routes.js handles request
    ↓
Calls Groq API with message
    ↓
Response returned to frontend
    ↓
Frontend displays response + optional voice output
```

### Database Query
```
Component calls supabase.from('table').select()
    ↓
Supabase client connects to database
    ↓
RLS policies check user permissions
    ↓
Data returned if authorized
    ↓
Frontend displays data
```

### Messaging
```
User sends message
    ↓
Frontend calls fetch('/api/messages', POST)
    ↓
Backend saves to database via Supabase
    ↓
Real-time subscription notifies other users
    ↓
Messages displayed in UI
```

---

## How to Add a New API Endpoint

### Step 1: Create Backend Route

**File:** `backend/my-feature-routes.js`

```javascript
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
```

### Step 2: Mount Route in Server

**File:** `backend/server.js`

```javascript
import { initializeMyFeatureRoutes } from './my-feature-routes.js';

// Add this line with other route initializations
initializeMyFeatureRoutes(app);
```

### Step 3: Call from Frontend

**File:** Any component

```typescript
const response = await fetch('/api/my-feature/action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: myData })
});

const result = await response.json();
```

---

## Troubleshooting Connection Issues

### Frontend can't reach backend
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Check if frontend proxy is configured
# Look in vite.config.ts for proxy settings

# Restart both services
# Terminal 1: cd backend && npm run dev
# Terminal 2: npm run dev
```

### Database connection fails
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verify Supabase credentials are correct
# Test connection: node test-connection.js
```

### CORS errors
```
# Backend should have CORS enabled
# In backend/server.js:
app.use(cors());

# If still failing, check:
# 1. Frontend URL is allowed
# 2. Credentials are included in requests
```

---

## Development vs Production

### Development
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`
- Vite proxy handles routing
- Hot reload enabled

### Production
- Frontend: Deployed to Vercel/Netlify
- Backend: Deployed to Heroku/Railway/VPS
- Update API URLs in environment variables
- No Vite proxy needed (use full URLs)

**Production Frontend Call:**
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';

const response = await fetch(`${API_URL}/api/groq/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

---

## Summary

| Component | File | Port | Purpose |
|-----------|------|------|---------|
| Frontend | `vite.config.ts` | 8080 | React app + proxy |
| Backend | `backend/server.js` | 3001 | Express API server |
| Database | `src/lib/supabase.ts` | - | Supabase connection |
| Routes | `backend/*-routes.js` | 3001 | API endpoints |

**Key Points:**
- Frontend and backend are separate services
- Vite proxy routes `/api/*` calls to backend
- Supabase handles database and authentication
- Environment variables configure all connections
- Each service can be deployed independently
