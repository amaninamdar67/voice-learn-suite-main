# AI Tutor - Quick Start After Fixes

## What Was Fixed

✅ **Auto-Send Voice Input** - Now properly detects 2 seconds of silence and auto-sends  
✅ **Session Creation** - New sessions are created and saved to database  
✅ **Authentication** - Improved token retrieval and validation  
✅ **Response Handling** - Better sanitization of AI responses  
✅ **Error Logging** - Comprehensive logging for debugging  

---

## How to Start

### 1. Restart Backend
```bash
# Kill current backend process (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify Ollama is Running
```bash
# In another terminal:
ollama serve
```

### 3. Verify Models are Downloaded
```bash
ollama list
```

You should see:
- `mistral:latest` or similar (for text)
- `llava:7b` (for image analysis)
- `deepseek-r1:1.5b` (optional, for reasoning)

If missing, download:
```bash
ollama pull llava:7b
ollama pull deepseek-r1:1.5b
```

### 4. Open Application
- Navigate to your app
- Log in as Student/Teacher/Mentor/Admin (NOT Parent)
- Click 🤖 icon in top bar

---

## Quick Test (2 minutes)

### Test 1: Voice Auto-Send
1. Click 🤖 AI Tutor
2. Click microphone button (red)
3. Say: "What is AI?"
4. Stop speaking, wait 2 seconds
5. ✅ Message should auto-send

### Test 2: Manual Send
1. Type: "Explain machine learning"
2. Press Enter
3. ✅ AI should respond

### Test 3: Session Creation
1. Send a message
2. Click 📋 Recent button
3. ✅ Session should appear in sidebar

### Test 4: Image Analysis
1. Click 📷 image button
2. Upload an image
3. Type: "What's in this image?"
4. Send
5. ✅ Model should auto-switch to llava:7b
6. ✅ AI should analyze image

---

## Monitoring Logs

### Browser Console (F12)
Look for these prefixes:
- `[Auto-Send]` - Voice input events
- `[AI Tutor]` - Frontend operations
- `[Auth]` - Authentication
- `[Sessions]` - Session management

### Backend Console
Look for these prefixes:
- `[Sessions]` - Session operations
- `[Auth]` - Auth middleware
- `[AI Chat]` - AI processing

---

## Common Issues & Quick Fixes

### Issue: "Auto-send not working"
**Check**: Browser console for `[Auto-Send]` logs  
**Fix**: 
1. Restart backend
2. Check microphone permissions
3. Verify 2-second silence is detected

### Issue: "Session not created"
**Check**: Console for `[Sessions]` logs  
**Fix**:
1. Verify you're logged in
2. Check if token is in localStorage
3. Restart backend

### Issue: "JSON parse error"
**Check**: Backend console for `[AI Chat]` logs  
**Fix**:
1. Restart Ollama
2. Check if model is responding
3. Try different model

### Issue: "Image not analyzed"
**Check**: Is LLaVA downloaded? `ollama list`  
**Fix**:
1. Download LLaVA: `ollama pull llava:7b`
2. Verify model selector shows `llava:7b`
3. Check image file size (should be < 10MB)

### Issue: "No audio output"
**Check**: Browser audio permissions  
**Fix**:
1. Check speaker is not muted
2. Allow audio in browser permissions
3. Try clicking "Read (Hindi)" button manually

---

## Key Features

### Voice Input
- **Language**: English (en-US)
- **Auto-send**: 2 seconds of silence
- **Manual**: Click microphone button to toggle

### Voice Output
- **Language**: Hindi (hi-IN)
- **Auto-play**: Enabled by default (green speaker icon)
- **Manual**: Click "Read (Hindi)" button on any response

### Image Analysis
- **Model**: LLaVA 7B (auto-selected when image uploaded)
- **Formats**: JPG, PNG, GIF, WebP
- **Max size**: ~10MB (base64 encoded)

### Session Management
- **Auto-save**: Messages saved when sent
- **Recent**: Shows last 20 sessions
- **Delete**: Soft-delete (can be recovered from database)
- **Persistence**: All data stored in Supabase

### Model Selection
- **Available**: All models from Ollama
- **Filtered**: Qwen models removed (user preference)
- **Auto-switch**: LLaVA selected when image uploaded
- **Recommended**: 
  - Text: `mistral:latest` or `deepseek-r1:1.5b`
  - Images: `llava:7b`

---

## Performance Tips

### For Faster Responses
1. Use `mistral:latest` (faster than deepseek)
2. Keep messages concise
3. Ensure Ollama has enough RAM (8GB+ recommended)

### For Better Accuracy
1. Use `deepseek-r1:1.5b` (more accurate)
2. Provide context in your question
3. Use image analysis for visual problems

### For Image Analysis
1. Ensure image is clear and well-lit
2. Keep image size reasonable (< 5MB)
3. Ask specific questions about the image

---

## Database Schema

### Tables
- `ai_tutor_sessions` - Chat sessions (id, user_id, title, timestamps)
- `ai_tutor_messages` - Messages (id, session_id, role, content, image_data)

### Indexes
- `idx_ai_tutor_sessions_user_id` - Fast user lookup
- `idx_ai_tutor_sessions_created_at` - Fast sorting
- `idx_ai_tutor_messages_session_id` - Fast message lookup

### Security
- RLS enabled on both tables
- Users can only access their own sessions
- Service role key used only on backend

---

## API Endpoints

### Chat
- `POST /api/ai-tutor/chat` - Send message to AI
  - Body: `{ message, model, image? }`
  - Response: `{ response, model }`

### Sessions
- `GET /api/ai-tutor/sessions` - List user's sessions
- `POST /api/ai-tutor/sessions` - Create new session
- `GET /api/ai-tutor/sessions/:id` - Load session with messages
- `POST /api/ai-tutor/sessions/:id/messages` - Save message
- `DELETE /api/ai-tutor/sessions/:id` - Delete session
- `PATCH /api/ai-tutor/sessions/:id` - Update session title

All endpoints require `Authorization: Bearer {token}` header

---

## Debugging Commands

### Check Ollama Status
```bash
curl http://localhost:11434/api/tags
```

### Check Available Models
```bash
ollama list
```

### Test Ollama Directly
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral:latest","prompt":"Hello","stream":false}'
```

### Check Database
```bash
# In Supabase dashboard:
# 1. Go to SQL Editor
# 2. Run: SELECT * FROM ai_tutor_sessions LIMIT 10;
# 3. Run: SELECT * FROM ai_tutor_messages LIMIT 10;
```

---

## Next Steps

1. ✅ Restart backend
2. ✅ Verify Ollama running
3. ✅ Test voice auto-send
4. ✅ Test session creation
5. ✅ Test image analysis
6. ✅ Monitor console logs
7. ✅ Report any issues with console logs

---

## Support

If something isn't working:
1. Check browser console (F12) for `[Auto-Send]`, `[AI Tutor]`, `[Auth]` logs
2. Check backend console for `[Sessions]`, `[Auth]`, `[AI Chat]` logs
3. Verify Ollama is running: `ollama serve`
4. Verify models are downloaded: `ollama list`
5. Restart backend: `npm run dev`
6. Clear browser cache and reload

---

## Files Modified

- `src/components/AITutor/AITutorNew.tsx` - Enhanced component with logging
- `backend/ai-tutor-routes.js` - Improved AI chat handling
- `backend/ai-tutor-sessions-routes.js` - Enhanced session management

All changes are backward compatible and don't affect other features.

