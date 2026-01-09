# Voice Learn Suite - Commands Reference

Complete list of all commands found in documentation files.

---

## Frontend Commands

### Development & Build
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

### Specific Tasks
```bash
# Seed admin data (one-time deployment)
npm run seed:admin

# Seed initial data
npm run seed

# Verify database
npm run verify-db
```

---

## Backend Commands

### Server Startup
```bash
# Start backend server (main)
node server.js

# Start backend with npm
npm start

# Start development mode
npm run dev

# Start Ollama AI server
node ollama-server.js

# Start voice server
node voice-server.js

# Start Whisper voice server
node whisper-voice-server.js
```

### Database & Migrations
```bash
# Check subdomain columns
node backend/check-subdomain-columns.js

# Apply migrations
node backend/apply-migration.js

# Setup subdomain defaults
node backend/setup-subdomain-defaults.js

# Parent-student data
node backend/parent-student-data.js
```

### Testing & Verification
```bash
# Test Ollama connection
node test-ollama-connection.js

# Test Ollama directly
node test-ollama.js

# Check LMS tables
node check-lms-tables.js

# Check subdomain columns
node check-subdomain-columns.js

# View database
node view-database.js

# Fix Varun role
node fix-varun-role.js

# Create user messages table
node create-user-messages-table.js

# Setup mentor test data
node setup-mentor-test-data.js

# Run migration
node run-migration.js

# Apply tag migration
node apply-tag-migration.js

# Apply user messages migration
node apply-user-messages-migration.js

# Apply announcement tag migration
node apply-announcement-tag-migration.js
```

---

## Git Commands

### Repository Management
```bash
# Clone repository
git clone <repository-url>

# Navigate to project
cd project-folder
cd project-directory
```

---

## API Testing Commands

### Ollama API Tests
```bash
# Check Ollama status / list models
curl http://localhost:11434/api/tags

# Test Ollama model directly
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral:latest","prompt":"Hello","stream":false}'

# Test DeepSeek model
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1:1.5b",
  "prompt": "What is AI?",
  "stream": false
}'

# Test model with POST
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:latest",
    "prompt": "Your prompt here",
    "stream": false
  }'
```

### Backend API Tests
```bash
# Test DELETE method
curl -X DELETE http://localhost:3001/api/test-delete/123

# Test community posts endpoint
curl http://localhost:3001/api/community/posts/test-id

# Delete community post
curl -X DELETE http://localhost:3001/api/community/posts/$POST_ID
```

---

## Package Installation Commands

### AI & ML Libraries
```bash
# Groq SDK
npm install groq-sdk

# Google Gemini
npm install @google/generative-ai

# Claude (Anthropic)
npm install @anthropic-ai/sdk

# OpenAI
npm install openai

# Both Groq and Claude
npm install groq-sdk @anthropic-ai/sdk
```

### Voice & Audio
```bash
# Multer (file upload)
npm install multer

# Whisper dependencies
npm install multer

# PDF parsing
npm install pdf-parse

# Document parsing
npm install mammoth

# OCR
npm install tesseract.js
```

### Voice Navigation
```bash
# Alan AI SDK
npm install @alan-ai/alan-sdk-web
```

### Combined Installations
```bash
# AI Quiz Generator dependencies
npm install openai pdf-parse mammoth tesseract.js

# All AI providers
npm install groq-sdk @google/generative-ai @anthropic-ai/sdk openai
```

---

## Server Ports Reference

| Service | Port | Command |
|---------|------|---------|
| Frontend Dev | 5173 | `npm run dev` |
| Frontend Alt | 8080 | `npm run dev` |
| Frontend Alt | 8083 | `npm run dev` |
| Backend API | 3001 | `node server.js` |
| Ollama AI | 11434 | `node ollama-server.js` |
| Ollama API | 11434 | (default Ollama) |

---

## Terminal Setup (Multi-Terminal)

### Setup 1: Basic (Frontend + Backend)
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

### Setup 2: With Ollama
```bash
# Terminal 1 - Backend
cd backend
node ollama-server.js

# Terminal 2 - Frontend
npm run dev
```

### Setup 3: Advanced (Backend + Frontend + Ollama)
```bash
# Terminal 1 - Ollama AI Server
cd backend
node ollama-server.js

# Terminal 2 - Backend API
cd backend
node server.js

# Terminal 3 - Frontend
npm run dev
```

### Setup 4: Development Mode
```bash
# Terminal 1 - Backend (dev mode)
cd backend
npm run dev

# Terminal 2 - Frontend (dev mode)
npm run dev
```

---

## Troubleshooting Commands

### Check Services
```bash
# Is backend running?
curl http://localhost:3001/api/community/posts/test-id

# Is Ollama running?
curl http://localhost:11434/api/tags

# Test Ollama connection
node test-ollama-connection.js

# Test Ollama directly
node test-ollama.js
```

### Restart Services
```bash
# Kill current backend (Ctrl+C in terminal)
# Then restart:
npm run dev

# Kill Ollama (if stuck)
# Restart Ollama service
```

### Database Checks
```bash
# Check LMS tables
node check-lms-tables.js

# Check subdomain columns
node check-subdomain-columns.js

# View database
node view-database.js

# Verify database
npm run verify-db
```

---

## Deployment Commands

### Build & Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production backend
npm start

# Start development server
npm run dev
```

### One-Time Setup
```bash
# Seed admin data
npm run seed:admin

# Seed initial data
npm run seed

# Apply migrations
node backend/apply-migration.js

# Setup subdomain defaults
node backend/setup-subdomain-defaults.js
```

---

## Quick Reference by Use Case

### I want to start the app
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
npm run dev
```

### I want to test Ollama
```bash
curl http://localhost:11434/api/tags
node test-ollama-connection.js
```

### I want to test an API endpoint
```bash
curl http://localhost:3001/api/community/posts/test-id
curl -X DELETE http://localhost:3001/api/test-delete/123
```

### I want to install AI providers
```bash
npm install groq-sdk @google/generative-ai @anthropic-ai/sdk
```

### I want to check database
```bash
node check-lms-tables.js
node view-database.js
npm run verify-db
```

### I want to setup fresh
```bash
npm install
npm run seed:admin
npm run seed
npm run dev
```

---

## Notes

- All `npm` commands should be run in the project root or specified directory
- Backend commands should be run from the `backend/` directory unless specified
- Use `Ctrl+C` to stop running services
- Open multiple terminals for running multiple services simultaneously
- Ensure ports 3001, 5173, and 11434 are available
- Check `.env` file is properly configured before running services

---

## File Locations

| Command | Location |
|---------|----------|
| `npm run dev` | Root directory |
| `node server.js` | `backend/` directory |
| `node test-ollama.js` | Root directory |
| `node check-lms-tables.js` | Root directory |
| Database scripts | `backend/` or root directory |

---

For more details, see `TECH_OVERVIEW.md` and archived documentation in `docs_archive/` folder.
