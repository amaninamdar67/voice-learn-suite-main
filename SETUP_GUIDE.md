# Voice Learn Suite - Complete Setup Guide

Step-by-step guide to set up and run the entire project.

---

## Prerequisites

- **Node.js** 16+ (download from https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for cloning repository)
- **Supabase Account** (free tier: https://supabase.com/)
- **API Keys** for AI providers (free tiers available)

---

## Step 1: Clone Repository

```bash
# Clone the project
git clone <your-repository-url>

# Navigate to project
cd voice-learn-suite
```

---

## Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## Step 3: Set Up Supabase

### Create Supabase Project

1. Go to https://supabase.com/
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to initialize

### Get Supabase Keys

1. Go to Project Settings → API
2. Copy these keys:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Set Up Database

1. Go to SQL Editor in Supabase
2. Run all SQL files from `database/` folder in order:
   - `01_*.sql` first
   - `02_*.sql` second
   - Continue in numerical order
3. This creates all tables and RLS policies

---

## Step 4: Get AI Provider Keys

### Groq (Recommended - Free, Unlimited)

1. Go to https://console.groq.com/
2. Sign up for free account
3. Create API key
4. Copy key → `GROQ_API_KEY`

### Google Gemini (Free, 60 req/min)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy key → `GEMINI_API_KEY`

### Perplexity (Free tier available)

1. Go to https://www.perplexity.ai/
2. Sign up and get API key
3. Copy key → `PERPLEXITY_API_KEY`

### Claude (Optional - Paid)

1. Go to https://console.anthropic.com/
2. Create account and add payment
3. Create API key
4. Copy key → `CLAUDE_API_KEY`

---

## Step 5: Configure Environment Variables

### Create Root .env

Create file `.env` in project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Create Backend .env

Create file `backend/.env`:

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
CLAUDE_API_KEY=your_claude_key (optional)
```

---

## Step 6: Create Test Users

### Create Users in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Create test users:

**Student User:**
- Email: `student@example.com`
- Password: `password123`

**Teacher User:**
- Email: `teacher@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `password123`

### Set User Roles

1. Go to SQL Editor
2. Run this SQL:

```sql
-- Set student role
UPDATE profiles 
SET role = 'student' 
WHERE email = 'student@example.com';

-- Set teacher role
UPDATE profiles 
SET role = 'teacher' 
WHERE email = 'teacher@example.com';

-- Set admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

---

## Step 7: Start Development Services

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Backend running on http://localhost:3001
```

### Terminal 2: Frontend

```bash
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

### Terminal 3: (Optional) Ollama

If using Ollama for local AI:

```bash
# Install Ollama from https://ollama.ai/
# Then run:
ollama serve
```

---

## Step 8: Access Application

1. Open browser
2. Go to `http://localhost:8080`
3. Login with test user:
   - Email: `student@example.com`
   - Password: `password123`

---

## Step 9: Verify Everything Works

### Test Frontend

- [ ] Page loads without errors
- [ ] Can log in
- [ ] Dashboard displays
- [ ] Dark mode toggle works

### Test Backend

```bash
# In terminal or curl
curl http://localhost:3001/api/health
```

Expected response: `{"status":"ok"}`

### Test Database

```bash
# In Supabase SQL Editor
SELECT * FROM profiles LIMIT 1;
```

Should return user records.

### Test AI

1. Go to AI Tutor section
2. Ask a question
3. Should get response from Groq

### Test Voice (Optional)

1. Click microphone button
2. Speak a question
3. Should transcribe and send to AI

---

## Troubleshooting Setup

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Can't Connect to Database

```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Verify Supabase project is active
# Verify credentials are correct
# Check internet connection
```

### Frontend Can't Reach Backend

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check Vite proxy in vite.config.ts
# Restart both services
```

### AI Not Responding

```bash
# Check API key in backend/.env
# Verify API key is valid
# Check rate limits
# Try different AI provider
```

### Database Tables Don't Exist

```bash
# Run SQL files again in Supabase SQL Editor
# Start with 01_*.sql, then 02_*.sql, etc.
# Check for SQL errors
```

### Can't Log In

```bash
# Check user exists in Supabase Authentication
# Verify password is correct
# Check profiles table has user record
# Verify role is set correctly
```

---

## Project Structure After Setup

```
voice-learn-suite/
├── .env                    # Frontend env vars
├── backend/
│   ├── .env               # Backend env vars
│   ├── server.js          # Express server
│   ├── *-routes.js        # API routes
│   └── node_modules/      # Backend dependencies
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities
│   └── App.tsx           # Main app
├── database/             # SQL migrations
├── node_modules/         # Frontend dependencies
├── package.json          # Frontend dependencies
├── vite.config.ts        # Vite config
└── README.md             # This file
```

---

## Next Steps

### 1. Explore Features

- [ ] Student Dashboard
- [ ] Teacher Content Creation
- [ ] AI Tutor Chat
- [ ] Messaging System
- [ ] Voice Navigation
- [ ] Admin Panel

### 2. Customize

- [ ] Update branding/colors
- [ ] Add your content
- [ ] Configure AI providers
- [ ] Set up custom domain

### 3. Deploy

- [ ] Build frontend: `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Deploy backend to Heroku/Railway
- [ ] Set up custom domain

---

## Common Commands

```bash
# Development
npm run dev              # Start frontend
cd backend && npm run dev # Start backend

# Building
npm run build            # Build for production

# Database
node check-lms-tables.js           # Check tables
node view-database.js              # View data

# Testing
curl http://localhost:3001/api/health  # Test backend
curl http://localhost:8080             # Test frontend

# Stopping
Ctrl+C                   # Stop current service
taskkill /IM node.exe /F # Kill all Node processes (Windows)
```

---

## Environment Variables Reference

### Frontend (.env)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Database URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Public API key |

### Backend (backend/.env)

| Variable | Example | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Database URL |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Admin API key |
| `GROQ_API_KEY` | `gsk_...` | Groq API key |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini key |
| `PERPLEXITY_API_KEY` | `pplx_...` | Perplexity key |
| `CLAUDE_API_KEY` | `sk-ant-...` | Claude API key |

---

## Getting Help

- Check browser console (F12) for errors
- Check backend terminal for logs
- Review `README.md` for overview
- Check `API_REFERENCE.md` for endpoints
- Review code comments in components

---

## Security Notes

- Never commit `.env` files to git
- Keep API keys secret
- Use environment variables for all secrets
- Enable RLS policies in Supabase
- Use HTTPS in production
- Regularly update dependencies

---

**Setup Complete!** 🎉

You now have a fully functional Voice Learn Suite instance running locally. Start exploring and building!

---

**Last Updated:** January 2026
**Version:** 2.0
